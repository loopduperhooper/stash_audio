package manager

import (
	"context"
	"fmt"
	"io/fs"
	"path/filepath"
	"time"

	"github.com/stashapp/stash_audio/internal/manager/config"
	"github.com/stashapp/stash_audio/pkg/file"
	"github.com/stashapp/stash_audio/pkg/fsutil"
	"github.com/stashapp/stash_audio/pkg/job"
	"github.com/stashapp/stash_audio/pkg/logger"
	"github.com/stashapp/stash_audio/pkg/models"
)

type cleaner interface {
	Clean(ctx context.Context, options file.CleanOptions, progress *job.Progress)
}

type cleanJob struct {
	cleaner    cleaner
	repository models.Repository
	input      CleanMetadataInput
	scanSubs   *subscriptionManager
}

func (j *cleanJob) Execute(ctx context.Context, progress *job.Progress) error {
	logger.Infof("Starting cleaning of tracked files")
	start := time.Now()
	if j.input.DryRun {
		logger.Infof("Running in Dry Mode")
	}

	j.cleaner.Clean(ctx, file.CleanOptions{
		Paths:      j.input.Paths,
		DryRun:     j.input.DryRun,
		PathFilter: newCleanFilter(instance.Config),
	}, progress)

	if job.IsCancelled(ctx) {
		logger.Info("Stopping due to user request")
		return nil
	}

	j.scanSubs.notify()
	elapsed := time.Since(start)
	logger.Info(fmt.Sprintf("Finished Cleaning (%s)", elapsed))
	return nil
}

type cleanFilter struct {
	scanFilter
}

func newCleanFilter(c *config.Config) *cleanFilter {
	return &cleanFilter{
		scanFilter: scanFilter{
			extensionConfig:   newExtensionConfig(c),
			stashPaths:        c.GetStashPaths(),
			generatedPath:     c.GetGeneratedPath(),
			audioExcludeRegex: generateRegexps(c.GetAudioExcludes()),
			stashIgnoreFilter: file.NewStashIgnoreFilter(),
		},
	}
}

func (f *cleanFilter) Accept(ctx context.Context, path string, info fs.FileInfo) bool {
	generatedPath := f.generatedPath

	var stash *config.StashConfig
	fileOrFolder := "File"

	if info.IsDir() {
		fileOrFolder = "Folder"
		stash = f.stashPaths.GetStashFromDirPath(path)
	} else {
		stash = f.stashPaths.GetStashFromPath(path)
	}

	if stash == nil {
		logger.Infof("%s not in any stash library directories. Marking to clean: %q", fileOrFolder, path)
		return false
	}

	if fsutil.IsPathInDir(generatedPath, path) {
		logger.Infof("%s is in generated path. Marking to clean: %q", fileOrFolder, path)
		return false
	}

	if !f.stashIgnoreFilter.Accept(ctx, path, info, stash.Path) {
		logger.Infof("%s is excluded due to .stashignore. Marking to clean: %q", fileOrFolder, path)
		return false
	}

	if info.IsDir() {
		return !f.shouldCleanFolder(path, stash)
	}

	return !f.shouldCleanFile(path, stash)
}

func (f *cleanFilter) shouldCleanFolder(path string, s *config.StashConfig) bool {
	pathExcludeTest := path + string(filepath.Separator)
	if s.ExcludeAudio || matchFileRegex(pathExcludeTest, f.audioExcludeRegex) {
		logger.Infof("Folder is excluded from audio. Marking to clean: \"%s\"", path)
		return true
	}
	return false
}

func (f *cleanFilter) shouldCleanFile(path string, stash *config.StashConfig) bool {
	if useAsAudio(path) {
		return f.shouldCleanAudioFile(path, stash)
	}

	logger.Infof("File extension does not match audio extensions. Marking to clean: \"%s\"", path)
	return true
}

func (f *cleanFilter) shouldCleanAudioFile(path string, stash *config.StashConfig) bool {
	if stash.ExcludeAudio {
		logger.Infof("File in stash library that excludes audio. Marking to clean: \"%s\"", path)
		return true
	}

	if matchFileRegex(path, f.audioExcludeRegex) {
		logger.Infof("File matched regex. Marking to clean: \"%s\"", path)
		return true
	}

	return false
}

type cleanHandler struct{}

func (h *cleanHandler) HandleFile(ctx context.Context, fileDeleter *file.Deleter, fileID models.FileID) error {
	return h.handleRelatedAudios(ctx, fileDeleter, fileID)
}

func (h *cleanHandler) HandleFolder(ctx context.Context, _ *file.Deleter, _ models.FolderID) error {
	return nil
}

func (h *cleanHandler) handleRelatedAudios(ctx context.Context, _ *file.Deleter, fileID models.FileID) error {
	mgr := GetInstance()
	audioQB := mgr.Repository.Audio
	audios, err := audioQB.FindByFileID(ctx, fileID)
	if err != nil {
		return err
	}

	for _, a := range audios {
		if err := a.LoadFiles(ctx, audioQB); err != nil {
			return err
		}

		if len(a.Files.List()) <= 1 {
			logger.Infof("Deleting audio %q since it has no other related files", a.DisplayName())
			if err := audioQB.Destroy(ctx, a.ID); err != nil {
				return err
			}
		} else {
			var newPrimaryID models.FileID
			for _, f := range a.Files.List() {
				if f.Base().ID != fileID {
					newPrimaryID = f.Base().ID
					break
				}
			}

			audioPartial := models.NewAudioPartial()
			audioPartial.PrimaryFileID = &newPrimaryID

			if _, err := mgr.Repository.Audio.UpdatePartial(ctx, a.ID, audioPartial); err != nil {
				return err
			}
		}
	}

	return nil
}
