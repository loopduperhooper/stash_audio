package audio

import (
	"context"
	"errors"
	"fmt"

	"github.com/stashapp/stash/pkg/ffmpeg"
	"github.com/stashapp/stash/pkg/logger"
	"github.com/stashapp/stash/pkg/models"
	"github.com/stashapp/stash/pkg/plugin"
	"github.com/stashapp/stash/pkg/plugin/hook"
)

var ErrNotAudioFile = errors.New("not an audio file")

// matchableFingerprintTypes are the fingerprint types used for audio matching.
var matchableFingerprintTypes = []string{models.FingerprintTypeMD5}

// ScanCreatorUpdater is the interface needed by ScanHandler to create and update audios.
type ScanCreatorUpdater interface {
	FindByFileID(ctx context.Context, fileID models.FileID) ([]*models.Audio, error)
	FindByFingerprints(ctx context.Context, fp []models.Fingerprint) ([]*models.Audio, error)
	GetFiles(ctx context.Context, relatedID int) ([]models.File, error)

	Create(ctx context.Context, newAudio *models.Audio, fileIDs []models.FileID) error
	UpdatePartial(ctx context.Context, id int, updatedAudio models.AudioPartial) (*models.Audio, error)
	AddFileID(ctx context.Context, id int, fileID models.FileID) error
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
	} else {
		// create a new audio
		newAudio := models.NewAudio()

		logger.Infof("%s doesn't exist. Creating new audio...", f.Base().Path)

		if err := h.CreatorUpdater.Create(ctx, &newAudio, []models.FileID{audioFile.ID}); err != nil {
			return fmt.Errorf("creating new audio: %w", err)
		}

		h.extractCoverIfMissing(ctx, newAudio.ID, f.Base().Path)

		if h.PluginCache != nil {
			h.PluginCache.RegisterPostHooks(ctx, newAudio.ID, hook.AudioCreatePost, nil, nil)
		}
	}

	return nil
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

// extractCoverIfMissing extracts embedded cover art from filePath and stores
// it for audioID, but only when no cover is already set. Errors are logged
// and not propagated so cover extraction never aborts a scan.
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
		logger.Warnf("storing cover for audio %d: %v", audioID, err)
	}
}
