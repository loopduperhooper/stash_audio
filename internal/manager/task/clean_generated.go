package task

import (
	"context"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strconv"

	"github.com/stashapp/stash_audio/internal/manager/config"
	"github.com/stashapp/stash_audio/pkg/job"
	"github.com/stashapp/stash_audio/pkg/logger"
	"github.com/stashapp/stash_audio/pkg/models"
	"github.com/stashapp/stash_audio/pkg/models/paths"
)

type CleanGeneratedOptions struct {
	BlobFiles bool `json:"blobs"`
	DryRun    bool `json:"dryRun"`
}

type BlobCleaner interface {
	EntryExists(ctx context.Context, checksum string) (bool, error)
}

type CleanGeneratedJob struct {
	Options CleanGeneratedOptions

	Paths            *paths.Paths
	BlobsStorageType config.BlobsStorageType

	BlobCleaner BlobCleaner
	Repository  models.Repository

	dryRunPrefix  string
	totalTasks    int
	tasksComplete int
}

func (j *CleanGeneratedJob) deleteFile(path string) {
	if j.Options.DryRun {
		logger.Debugf("would delete file: %s", path)
		return
	}

	if err := os.Remove(path); err != nil {
		logger.Errorf("error deleting file %s: %v", path, err)
	}
}

func (j *CleanGeneratedJob) deleteDir(path string) {
	if j.Options.DryRun {
		logger.Debugf("would delete file: %s", path)
		return
	}

	if err := os.RemoveAll(path); err != nil {
		logger.Errorf("error deleting directory %s: %v", path, err)
	}
}

func (j *CleanGeneratedJob) countTasks() int {
	tasks := 0
	if j.Options.BlobFiles {
		tasks++
	}
	return tasks
}

func (j *CleanGeneratedJob) taskComplete(progress *job.Progress) {
	j.tasksComplete++
	progress.SetPercent(float64(j.tasksComplete) / float64(j.totalTasks))
}

func (j *CleanGeneratedJob) logError(err error) {
	if !errors.Is(err, context.Canceled) {
		logger.Error(err)
	}
}

func (j *CleanGeneratedJob) Execute(ctx context.Context, progress *job.Progress) error {
	j.tasksComplete = 0

	if !j.BlobsStorageType.IsValid() {
		return fmt.Errorf("invalid blobs storage type: %s", j.BlobsStorageType)
	}

	if j.Options.DryRun {
		j.dryRunPrefix = "[dry run] "
	}

	logger.Infof("Cleaning generated files %s", j.dryRunPrefix)

	j.totalTasks = j.countTasks()

	if j.Options.BlobFiles {
		progress.ExecuteTask("Cleaning blob files", func() {
			if err := j.cleanBlobFiles(ctx, progress); err != nil {
				j.logError(fmt.Errorf("error cleaning blob files: %w", err))
			}
		})
		j.taskComplete(progress)
	}

	if job.IsCancelled(ctx) {
		logger.Info("Stopping due to user request")
		return nil
	}

	logger.Infof("Finished cleaning generated files")
	return nil
}

func (j *CleanGeneratedJob) setTaskProgress(taskProgress float64, progress *job.Progress) {
	progress.SetPercent((float64(j.tasksComplete) + taskProgress) / float64(j.totalTasks))
}

func (j *CleanGeneratedJob) logDelete(format string, args ...interface{}) {
	logger.Infof(j.dryRunPrefix+format, args...)
}

func (j *CleanGeneratedJob) estimateProgress(hashPrefix string) (float64, error) {
	toInt, err := strconv.ParseInt(hashPrefix, 16, 64)
	if err != nil {
		return 0, err
	}

	const total = 256
	return float64(toInt) / total, nil
}

func (j *CleanGeneratedJob) setProgressFromFilename(prefix string, progress *job.Progress) {
	p, err := j.estimateProgress(prefix)
	if err != nil {
		logger.Errorf("error estimating progress: %v", err)
		return
	}
	j.setTaskProgress(p, progress)
}

func (j *CleanGeneratedJob) getIntraFolderPrefix(basename string) (string, error) {
	var hash string
	_, err := fmt.Sscanf(basename, "%2x", &hash)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", hash), nil
}

func (j *CleanGeneratedJob) getBlobFileHash(basename string) (string, error) {
	var hash string
	_, err := fmt.Sscanf(basename, "%32x", &hash)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", hash), nil
}

func (j *CleanGeneratedJob) cleanBlobFiles(ctx context.Context, progress *job.Progress) error {
	if job.IsCancelled(ctx) {
		return nil
	}

	if j.BlobsStorageType != config.BlobStorageTypeFilesystem {
		logger.Debugf("skipping blob file cleanup, storage type is not filesystem")
		return nil
	}

	logger.Infof("Cleaning blob files")

	if err := filepath.Walk(j.Paths.Blobs, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if err = ctx.Err(); err != nil {
			return err
		}

		if info.IsDir() {
			if path == j.Paths.Blobs {
				return nil
			}

			_, err := j.getIntraFolderPrefix(info.Name())
			if err != nil {
				logger.Warnf("Ignoring unknown directory: %s", path)
				return fs.SkipDir
			}

			if filepath.Dir(path) == j.Paths.Blobs {
				hashPrefix := filepath.Base(path)
				j.setProgressFromFilename(hashPrefix, progress)
			}

			return nil
		}

		blobname := info.Name()

		_, err = j.getBlobFileHash(blobname)
		if err != nil {
			logger.Warnf("ignoring unknown blob file: %s", blobname)
			return nil
		}

		if err := j.Repository.WithReadTxn(ctx, func(ctx context.Context) error {
			exists, err := j.BlobCleaner.EntryExists(ctx, blobname)
			if err != nil {
				return err
			}

			if !exists {
				j.logDelete("deleting unused blob file: %s", blobname)
				j.deleteFile(path)
			}

			return nil
		}); err != nil {
			logger.Errorf("error checking blob entry: %v", err)
			return nil
		}

		return nil
	}); err != nil {
		return err
	}

	return nil
}
