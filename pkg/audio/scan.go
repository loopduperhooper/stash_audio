package audio

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/stashapp/stash_audio/pkg/ffmpeg"
	"github.com/stashapp/stash_audio/pkg/fsutil"
	"github.com/stashapp/stash_audio/pkg/logger"
	"github.com/stashapp/stash_audio/pkg/models"
	"github.com/stashapp/stash_audio/pkg/plugin"
	"github.com/stashapp/stash_audio/pkg/plugin/hook"
)

var ErrNotAudioFile = errors.New("not an audio file")

// matchableFingerprintTypes are the fingerprint types used for audio matching.
var matchableFingerprintTypes = []string{models.FingerprintTypeMD5}

// ScanCreatorUpdater is the interface needed by ScanHandler to create and update audios.
type ScanCreatorUpdater interface {
	FindByFileID(ctx context.Context, fileID models.FileID) ([]*models.Audio, error)
	FindByFingerprints(ctx context.Context, fp []models.Fingerprint) ([]*models.Audio, error)
	GetFiles(ctx context.Context, relatedID int) ([]models.File, error)
	GetGroupIDs(ctx context.Context, id int) ([]int, error)

	Create(ctx context.Context, newAudio *models.Audio, fileIDs []models.FileID) error
	UpdatePartial(ctx context.Context, id int, updatedAudio models.AudioPartial) (*models.Audio, error)
	AddFileID(ctx context.Context, id int, fileID models.FileID) error
}

// GroupAssigner is the interface needed to find-or-create groups during scan.
type GroupAssigner interface {
	FindByName(ctx context.Context, name string, nocase bool) (*models.Group, error)
	Create(ctx context.Context, newGroup *models.Group) error
}

// CoverUpdater is the interface needed by ScanHandler to store cover art.
type CoverUpdater interface {
	HasCover(ctx context.Context, audioID int) (bool, error)
	UpdateCover(ctx context.Context, audioID int, cover []byte) error
}

// ScanHandler handles scanned audio files, creating or updating Audio records.
type ScanHandler struct {
	CreatorUpdater ScanCreatorUpdater
	CoverUpdater   CoverUpdater
	FFMpeg         *ffmpeg.FFMpeg
	PluginCache    *plugin.Cache
	// GroupAssigner enables auto-creating groups from subdirectory names on scan.
	// Set to nil to disable the feature.
	GroupAssigner GroupAssigner
	// LibraryPaths are the stash root paths used to determine subdirectory names.
	LibraryPaths []string
}

func (h *ScanHandler) validate() error {
	if h.CreatorUpdater == nil {
		return errors.New("CreatorUpdater is required")
	}
	return nil
}

func (h *ScanHandler) Handle(ctx context.Context, f models.File, oldFile models.File) error {
	if err := h.validate(); err != nil {
		return err
	}

	audioFile, ok := f.(*models.AudioFile)
	if !ok {
		return ErrNotAudioFile
	}

	// try to match the file to an existing audio
	existing, err := h.CreatorUpdater.FindByFileID(ctx, f.Base().ID)
	if err != nil {
		return fmt.Errorf("finding existing audio: %w", err)
	}

	if len(existing) == 0 {
		// try to match by fingerprints
		existing, err = h.CreatorUpdater.FindByFingerprints(ctx, audioFile.Fingerprints.Filter(matchableFingerprintTypes...))
		if err != nil {
			return fmt.Errorf("finding existing audio by fingerprints: %w", err)
		}
	}

	if len(existing) > 0 {
		updateExisting := oldFile != nil
		if err := h.associateExisting(ctx, existing, audioFile, updateExisting); err != nil {
			return err
		}
		for _, a := range existing {
			if err := h.associateSubdirGroup(ctx, a.ID, f.Base().Path); err != nil {
				logger.Warnf("auto-group for audio %d: %v", a.ID, err)
			}
		}
	} else {
		// create a new audio
		newAudio := models.NewAudio()

		logger.Infof("%s doesn't exist. Creating new audio...", f.Base().Path)

		if err := h.CreatorUpdater.Create(ctx, &newAudio, []models.FileID{audioFile.ID}); err != nil {
			return fmt.Errorf("creating new audio: %w", err)
		}

		h.extractCoverIfMissing(ctx, newAudio.ID, f.Base().Path)

		if err := h.associateSubdirGroup(ctx, newAudio.ID, f.Base().Path); err != nil {
			logger.Warnf("auto-group for audio %d: %v", newAudio.ID, err)
		}

		if h.PluginCache != nil {
			h.PluginCache.RegisterPostHooks(ctx, newAudio.ID, hook.AudioCreatePost, nil, nil)
		}
	}

	return nil
}

// associateSubdirGroup finds or creates a Group named after the audio file's
// immediate parent directory (relative to its library root) and adds the audio
// to that group. Files sitting directly in the library root are skipped.
func (h *ScanHandler) associateSubdirGroup(ctx context.Context, audioID int, filePath string) error {
	if h.GroupAssigner == nil || len(h.LibraryPaths) == 0 {
		return nil
	}

	dir := filepath.Dir(filePath)
	var stashRoot string
	for _, root := range h.LibraryPaths {
		if fsutil.IsPathInDir(root, dir) {
			stashRoot = root
			break
		}
	}
	if stashRoot == "" {
		return nil
	}

	rel, err := filepath.Rel(stashRoot, dir)
	if err != nil || rel == "." {
		return nil // file is directly in the library root
	}

	// Use the immediate parent directory name as the group name.
	// e.g. root/Album/track.mp3      → "Album"
	//      root/Artist/Album/track.mp3 → "Album"
	groupName := filepath.Base(rel)
	if groupName == "" || groupName == "." {
		return nil
	}

	// Find or create the group.
	group, err := h.GroupAssigner.FindByName(ctx, groupName, false)
	if err != nil {
		return fmt.Errorf("finding group %q: %w", groupName, err)
	}
	if group == nil {
		logger.Infof("Auto-creating group %q for %s", groupName, filePath)
		newGroup := models.NewGroup()
		newGroup.Name = groupName
		if err := h.GroupAssigner.Create(ctx, &newGroup); err != nil {
			return fmt.Errorf("creating group %q: %w", groupName, err)
		}
		group = &newGroup
	}

	// Skip if already a member.
	existingGroupIDs, err := h.CreatorUpdater.GetGroupIDs(ctx, audioID)
	if err != nil {
		return fmt.Errorf("getting group IDs for audio %d: %w", audioID, err)
	}
	if slices.Contains(existingGroupIDs, group.ID) {
		return nil
	}

	_, err = h.CreatorUpdater.UpdatePartial(ctx, audioID, models.AudioPartial{
		GroupIDs: &models.UpdateIDs{
			IDs:  []int{group.ID},
			Mode: models.RelationshipUpdateModeAdd,
		},
	})
	return err
}

func (h *ScanHandler) associateExisting(ctx context.Context, existing []*models.Audio, f *models.AudioFile, updateExisting bool) error {
	for _, a := range existing {
		if err := a.LoadFiles(ctx, h.CreatorUpdater); err != nil {
			return err
		}

		found := false
		for _, af := range a.Files.List() {
			if af.Base().ID == f.ID {
				found = true
				break
			}
		}

		if !found {
			logger.Infof("Adding %s to audio %s", f.Path, a.DisplayName())

			if err := h.CreatorUpdater.AddFileID(ctx, a.ID, f.ID); err != nil {
				return fmt.Errorf("adding file to audio: %w", err)
			}
		}

		if !found || updateExisting {
			audioPartial := models.NewAudioPartial()
			if _, err := h.CreatorUpdater.UpdatePartial(ctx, a.ID, audioPartial); err != nil {
				return fmt.Errorf("updating audio: %w", err)
			}

			if h.PluginCache != nil {
				h.PluginCache.RegisterPostHooks(ctx, a.ID, hook.AudioUpdatePost, nil, nil)
			}
		}

		// Extract cover if the audio has none yet (respects manually uploaded covers).
		if !found {
			h.extractCoverIfMissing(ctx, a.ID, f.Path)
		}
	}

	return nil
}

// extractCoverIfMissing finds cover art for audioID and stores it, but only
// when no cover is already set. It checks sidecar image files first (same
// directory, common cover names), then falls back to embedded art via ffmpeg.
// Errors are logged and not propagated so cover extraction never aborts a scan.
func (h *ScanHandler) extractCoverIfMissing(ctx context.Context, audioID int, filePath string) {
	if h.CoverUpdater == nil {
		return
	}

	hasCover, err := h.CoverUpdater.HasCover(ctx, audioID)
	if err != nil {
		logger.Warnf("checking cover for audio %d: %v", audioID, err)
		return
	}
	if hasCover {
		return
	}

	// 1. Look for sidecar image files.
	if cover := findSidecarCover(filePath); len(cover) > 0 {
		if err := h.CoverUpdater.UpdateCover(ctx, audioID, cover); err != nil {
			logger.Warnf("storing sidecar cover for audio %d: %v", audioID, err)
		}
		return
	}

	// 2. Fall back to embedded art.
	if h.FFMpeg == nil {
		return
	}

	cover, err := h.FFMpeg.ExtractEmbeddedCover(ctx, filePath)
	if err != nil {
		logger.Warnf("extracting embedded cover for %s: %v", filePath, err)
		return
	}
	if len(cover) == 0 {
		return
	}

	if err := h.CoverUpdater.UpdateCover(ctx, audioID, cover); err != nil {
		logger.Warnf("storing embedded cover for audio %d: %v", audioID, err)
	}
}

// sidecarCoverNames lists candidate filenames to check, in priority order.
// Also checks <audio-basename>.<ext> for each ext.
var sidecarCoverExts = []string{".jpg", ".jpeg", ".png", ".webp"}
var sidecarCoverNames = []string{"cover", "folder", "artwork", "front"}

func findSidecarCover(audioPath string) []byte {
	dir := filepath.Dir(audioPath)
	base := strings.TrimSuffix(filepath.Base(audioPath), filepath.Ext(audioPath))

	// Priority 1: same basename as audio file
	for _, ext := range sidecarCoverExts {
		candidate := filepath.Join(dir, base+ext)
		if data, err := os.ReadFile(candidate); err == nil {
			logger.Debugf("Using sidecar cover: %s", candidate)
			return data
		}
	}

	// Priority 2: common cover filenames in the same directory
	for _, name := range sidecarCoverNames {
		for _, ext := range sidecarCoverExts {
			candidate := filepath.Join(dir, name+ext)
			if data, err := os.ReadFile(candidate); err == nil {
				logger.Debugf("Using sidecar cover: %s", candidate)
				return data
			}
		}
	}

	return nil
}
