package manager

import (
	"context"
	"errors"
	"sync"
	"time"

	"github.com/stashapp/stash_audio/internal/manager/config"
	"github.com/stashapp/stash_audio/pkg/file"
	file_audio "github.com/stashapp/stash_audio/pkg/file/audio"
	"github.com/stashapp/stash_audio/pkg/fsutil"
	"github.com/stashapp/stash_audio/pkg/job"
	"github.com/stashapp/stash_audio/pkg/logger"
	"github.com/stashapp/stash_audio/pkg/models"
)

func useAsAudio(pathname string) bool {
	return isAudio(pathname)
}

func isAudio(pathname string) bool {
	aExt := config.GetInstance().GetAudioExtensions()
	return fsutil.MatchExtension(pathname, aExt)
}

func getScanPaths(inputPaths []string) []*config.StashConfig {
	stashPaths := config.GetInstance().GetStashPaths()

	if len(inputPaths) == 0 {
		return stashPaths
	}

	var ret config.StashConfigs
	for _, p := range inputPaths {
		s := stashPaths.GetStashFromDirPath(p)
		if s == nil {
			logger.Warnf("%s is not in the configured stash paths", p)
			continue
		}

		// make a copy, changing the path
		ss := *s
		ss.Path = p
		ret = append(ret, &ss)
	}

	return ret
}

// filterStashPaths filters the input array for paths that are within the paths managed by stash_audio
func filterStashPaths(inputPaths []string) []string {
	if len(inputPaths) == 0 {
		return inputPaths
	}

	stashPaths := config.GetInstance().GetStashPaths()

	var ret []string
	for _, p := range inputPaths {
		s := stashPaths.GetStashFromDirPath(p)
		if s == nil {
			logger.Warnf("%s is not in the configured stash paths", p)
			continue
		}

		ret = append(ret, p)
	}

	return ret
}

// ScanSubscribe subscribes to a notification that is triggered when a
// scan or clean is complete.
func (s *Manager) ScanSubscribe(ctx context.Context) <-chan bool {
	return s.scanSubs.subscribe(ctx)
}

type ScanMetadataInput struct {
	Paths []string `json:"paths"`

	config.ScanMetadataOptions `mapstructure:",squash"`

	// Filter options for the scan
	Filter *ScanMetaDataFilterInput `json:"filter"`
}

// Filter options for meta data scanning
type ScanMetaDataFilterInput struct {
	// If set, files with a modification time before this time point are ignored by the scan
	MinModTime *time.Time `json:"minModTime"`
}

func (s *Manager) Scan(ctx context.Context, input ScanMetadataInput) (int, error) {
	if err := s.validateFFmpeg(); err != nil {
		return 0, err
	}

	cfg := config.GetInstance()

	scanner := &file.Scanner{
		Repository: file.NewRepository(s.Repository),
		FileDecorators: []file.Decorator{
			&file.FilteredDecorator{
				Decorator: &file_audio.Decorator{
					FFProbe: s.FFProbe,
				},
				Filter: file.FilterFunc(audioFileFilter),
			},
		},
		FingerprintCalculator: &fingerprintCalculator{s.Config},
		FS:                    &file.OsFS{},
		// ScanFilters is set in ScanJob.Execute
		// HandlerRequiredFilters is set in ScanJob.Execute
		RootPaths: cfg.GetStashPaths().Paths(),
		Rescan:    input.Rescan,
	}

	scanJob := ScanJob{
		scanner:       scanner,
		input:         input,
		subscriptions: s.scanSubs,
	}

	return s.JobManager.Add(ctx, "Scanning...", &scanJob), nil
}

func (s *Manager) Import(ctx context.Context) (int, error) {
	config := config.GetInstance()
	metadataPath := config.GetMetadataPath()
	if metadataPath == "" {
		return 0, errors.New("metadata path must be set in config")
	}

	j := job.MakeJobExec(func(ctx context.Context, progress *job.Progress) error {
		task := ImportTask{
			repository:          s.Repository,
			resetter:            s.Database,
			BaseDir:             metadataPath,
			Reset:               true,
			DuplicateBehaviour:  ImportDuplicateEnumFail,
			MissingRefBehaviour: models.ImportMissingRefEnumFail,
			fileNamingAlgorithm: config.GetVideoFileNamingAlgorithm(),
		}
		task.Start(ctx)

		// TODO - return error from task
		return nil
	})

	return s.JobManager.Add(ctx, "Importing...", j), nil
}

func (s *Manager) Export(ctx context.Context) (int, error) {
	config := config.GetInstance()
	metadataPath := config.GetMetadataPath()
	if metadataPath == "" {
		return 0, errors.New("metadata path must be set in config")
	}

	j := job.MakeJobExec(func(ctx context.Context, progress *job.Progress) error {
		var wg sync.WaitGroup
		wg.Add(1)
		task := ExportTask{
			repository:          s.Repository,
			full:                true,
			fileNamingAlgorithm: config.GetVideoFileNamingAlgorithm(),
		}
		task.Start(ctx, &wg)
		// TODO - return error from task
		return nil
	})

	return s.JobManager.Add(ctx, "Exporting...", j), nil
}

func (s *Manager) RunSingleTask(ctx context.Context, t Task) int {
	var wg sync.WaitGroup
	wg.Add(1)

	j := job.MakeJobExec(func(ctx context.Context, progress *job.Progress) error {
		t.Start(ctx)
		defer wg.Done()
		// TODO - return error from task
		return nil
	})

	return s.JobManager.Add(ctx, t.GetDescription(), j)
}

type AutoTagMetadataInput struct {
	// Paths to tag, null for all files
	Paths []string `json:"paths"`
	// IDs of performers to tag files with, or "*" for all
	Performers []string `json:"performers"`
	// IDs of studios to tag files with, or "*" for all
	Studios []string `json:"studios"`
	// IDs of tags to tag files with, or "*" for all
	Tags []string `json:"tags"`
}

func (s *Manager) AutoTag(ctx context.Context, input AutoTagMetadataInput) int {
	j := autoTagJob{
		repository: s.Repository,
		input:      input,
	}

	return s.JobManager.Add(ctx, "Auto-tagging...", &j)
}

type CleanMetadataInput struct {
	Paths []string `json:"paths"`
	// Do a dry run. Don't delete any files
	DryRun bool `json:"dryRun"`
}

func (s *Manager) Clean(ctx context.Context, input CleanMetadataInput) int {
	cleaner := &file.Cleaner{
		FS:         &file.OsFS{},
		Repository: file.NewRepository(s.Repository),
		Handlers: []file.CleanHandler{
			&cleanHandler{},
		},
		TrashPath: s.Config.GetDeleteTrashPath(),
	}

	j := cleanJob{
		cleaner:    cleaner,
		repository: s.Repository,
		input:      input,
		scanSubs:   s.scanSubs,
	}

	return s.JobManager.Add(ctx, "Cleaning...", &j)
}

func (s *Manager) OptimiseDatabase(ctx context.Context) int {
	j := OptimiseDatabaseJob{
		Optimiser: s.Database,
	}

	return s.JobManager.Add(ctx, "Optimising database...", &j)
}
