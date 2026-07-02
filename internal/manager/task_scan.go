package manager

import (
	"context"
	"errors"
	"io/fs"
	"path/filepath"
	"regexp"
	"runtime/debug"
	"sync"
	"time"

	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/remeh/sizedwaitgroup"
	"github.com/stashapp/stash_audio/internal/manager/config"
	"github.com/stashapp/stash_audio/pkg/audio"
	"github.com/stashapp/stash_audio/pkg/file"
	"github.com/stashapp/stash_audio/pkg/fsutil"
	"github.com/stashapp/stash_audio/pkg/job"
	"github.com/stashapp/stash_audio/pkg/logger"
	"github.com/stashapp/stash_audio/pkg/models"
	"github.com/stashapp/stash_audio/pkg/txn"
	"github.com/stashapp/stash_audio/pkg/utils"
)

type ScanJob struct {
	scanner       *file.Scanner
	input         ScanMetadataInput
	subscriptions *subscriptionManager

	fileQueue chan file.ScannedFile
	count     int
}

func (j *ScanJob) Execute(ctx context.Context, progress *job.Progress) error {
	cfg := config.GetInstance()
	input := j.input

	if job.IsCancelled(ctx) {
		logger.Info("Stopping due to user request")
		return nil
	}

	sp := getScanPaths(input.Paths)
	paths := make([]string, len(sp))
	for i, p := range sp {
		paths[i] = p.Path
	}

	mgr := GetInstance()
	c := mgr.Config
	repo := mgr.Repository

	start := time.Now()

	nTasks := cfg.GetParallelTasksWithAutoDetection()

	const taskQueueSize = 200000
	taskQueue := job.NewTaskQueue(ctx, progress, taskQueueSize, nTasks)

	var minModTime time.Time
	if j.input.Filter != nil && j.input.Filter.MinModTime != nil {
		minModTime = *j.input.Filter.MinModTime
	}

	// HACK - these should really be set in the scanner initialization
	j.scanner.FileHandlers = getScanHandlers(j.input, taskQueue, progress)
	j.scanner.ScanFilters = []file.PathFilter{newScanFilter(c, repo, minModTime)}
	j.scanner.HandlerRequiredFilters = []file.Filter{newHandlerRequiredFilter(cfg, repo)}

	logger.Infof("Starting scan of %d paths with %d parallel tasks", len(paths), nTasks)

	j.runJob(ctx, paths, nTasks, progress)

	taskQueue.Close()

	if job.IsCancelled(ctx) {
		logger.Info("Stopping due to user request")
		return nil
	}

	elapsed := time.Since(start)
	logger.Infof("Scan finished (%s)", elapsed)

	j.subscriptions.notify()
	return nil
}

func (j *ScanJob) runJob(ctx context.Context, paths []string, nTasks int, progress *job.Progress) {
	var wg sync.WaitGroup
	wg.Add(1)

	j.fileQueue = make(chan file.ScannedFile, scanQueueSize)

	go func() {
		defer func() {
			wg.Done()

			// handle panics in goroutine
			if p := recover(); p != nil {
				logger.Errorf("panic while queuing files for scan: %v", p)
				logger.Errorf(string(debug.Stack()))
			}
		}()

		if err := j.queueFiles(ctx, paths, progress); err != nil {
			if errors.Is(err, context.Canceled) {
				return
			}

			logger.Errorf("error queuing files for scan: %v", err)
			return
		}

		logger.Infof("Finished adding files to queue. %d files queued", j.count)
	}()

	defer wg.Wait()

	j.processQueue(ctx, nTasks, progress)
}

const scanQueueSize = 200000

func (j *ScanJob) queueFiles(ctx context.Context, paths []string, progress *job.Progress) error {
	fs := &file.OsFS{}

	defer func() {
		close(j.fileQueue)

		progress.AddTotal(j.count)
		progress.Definite()
	}()

	var err error
	progress.ExecuteTask("Walking directory tree", func() {
		for _, p := range paths {
			err = file.SymWalk(fs, p, j.queueFileFunc(ctx, fs, nil, progress))
			if err != nil {
				return
			}
		}
	})

	return err
}

func (j *ScanJob) queueFileFunc(ctx context.Context, f models.FS, zipFile *file.ScannedFile, progress *job.Progress) fs.WalkDirFunc {
	return func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			// don't let errors prevent scanning
			logger.Errorf("error scanning %s: %v", path, err)
			return nil
		}

		if err = ctx.Err(); err != nil {
			return err
		}

		info, err := d.Info()
		if err != nil {
			logger.Errorf("reading info for %q: %v", path, err)
			return nil
		}

		if !j.scanner.AcceptEntry(ctx, path, info) {
			if info.IsDir() {
				logger.Debugf("Skipping directory %s", path)
				return fs.SkipDir
			}

			logger.Debugf("Skipping file %s", path)
			return nil
		}

		size, err := file.GetFileSize(f, path, info)
		if err != nil {
			return err
		}

		ff := file.ScannedFile{
			BaseFile: &models.BaseFile{
				DirEntry: models.DirEntry{
					ModTime: file.ModTime(info),
				},
				Path:     path,
				Basename: filepath.Base(path),
				Size:     size,
			},
			FS:   f,
			Info: info,
		}

		if zipFile != nil {
			ff.ZipFileID = &zipFile.ID
			ff.ZipFile = zipFile
		}

		if info.IsDir() {
			// handle folders immediately
			if err := j.handleFolder(ctx, ff, progress); err != nil {
				if !errors.Is(err, context.Canceled) {
					logger.Errorf("error processing %q: %v", path, err)
				}

				// skip the directory since we won't be able to process the files anyway
				return fs.SkipDir
			}

			return nil
		}

		logger.Tracef("Queueing file %s for scanning", path)
		j.fileQueue <- ff

		j.count++

		return nil
	}
}

func (j *ScanJob) processQueue(ctx context.Context, parallelTasks int, progress *job.Progress) {
	if parallelTasks < 1 {
		parallelTasks = 1
	}

	wg := sizedwaitgroup.New(parallelTasks)

	func() {
		defer func() {
			wg.Wait()

			// handle panics in goroutine
			if p := recover(); p != nil {
				logger.Errorf("panic while scanning files: %v", p)
				logger.Errorf(string(debug.Stack()))
			}
		}()

		for f := range j.fileQueue {
			logger.Tracef("Processing queued file %s", f.Path)
			if err := ctx.Err(); err != nil {
				return
			}

			wg.Add()
			ff := f
			go func() {
				defer wg.Done()
				j.processQueueItem(ctx, ff, progress)
			}()
		}
	}()
}

func (j *ScanJob) processQueueItem(ctx context.Context, f file.ScannedFile, progress *job.Progress) {
	progress.ExecuteTask("Scanning "+f.Path, func() {
		var err error
		if f.Info.IsDir() {
			err = j.handleFolder(ctx, f, progress)
		} else {
			err = j.handleFile(ctx, f, progress)
		}

		if err != nil && !errors.Is(err, context.Canceled) {
			logger.Errorf("error processing %q: %v", f.Path, err)
		}
	})
}

func (j *ScanJob) handleFolder(ctx context.Context, f file.ScannedFile, progress *job.Progress) error {
	if progress != nil {
		defer progress.Increment()
	}

	_, err := j.scanner.ScanFolder(ctx, f)
	if err != nil {
		return err
	}

	return nil
}

func (j *ScanJob) handleFile(ctx context.Context, f file.ScannedFile, progress *job.Progress) error {
	if progress != nil {
		defer progress.Increment()
	}

	_, err := j.scanner.ScanFile(ctx, f)
	if err != nil {
		return err
	}

	return nil
}

type extensionConfig struct {
	audioExt []string
}

func newExtensionConfig(c *config.Config) extensionConfig {
	return extensionConfig{
		audioExt: c.GetAudioExtensions(),
	}
}

type audioFileQuerier interface {
	CountByFileID(ctx context.Context, fileID models.FileID) (int, error)
	FindByFileID(ctx context.Context, fileID models.FileID) ([]*models.Audio, error)
	GetGroupIDs(ctx context.Context, id int) ([]int, error)
}

// handlerRequiredFilter returns true if a File's handler needs to be executed despite the file not being updated.
type handlerRequiredFilter struct {
	extensionConfig
	txnManager  txn.Manager
	AudioFinder audioFileQuerier

	FolderCache *lru.LRU[bool]
}

func newHandlerRequiredFilter(c *config.Config, repo models.Repository) *handlerRequiredFilter {
	processes := c.GetParallelTasksWithAutoDetection()

	return &handlerRequiredFilter{
		extensionConfig: newExtensionConfig(c),
		txnManager:      repo.TxnManager,
		AudioFinder:     repo.Audio,
		FolderCache:     lru.New[bool](processes * 2),
	}
}

func (f *handlerRequiredFilter) Accept(ctx context.Context, ff models.File) bool {
	path := ff.Base().Path
	isAudioFile := useAsAudio(path)

	if !isAudioFile {
		return false
	}

	audios, err := f.AudioFinder.FindByFileID(ctx, ff.Base().ID)
	if err != nil {
		return false
	}

	// New file — handler must run to create the audio record.
	if len(audios) == 0 {
		return true
	}

	// Existing file — run handler if any audio has no group assigned yet.
	for _, a := range audios {
		groupIDs, err := f.AudioFinder.GetGroupIDs(ctx, a.ID)
		if err != nil {
			continue
		}
		if len(groupIDs) == 0 {
			return true
		}
	}

	return false
}

type scanFilter struct {
	extensionConfig
	txnManager txn.Manager

	stashPaths        config.StashConfigs
	generatedPath     string
	audioExcludeRegex []*regexp.Regexp
	minModTime        time.Time
	stashIgnoreFilter *file.StashIgnoreFilter
}

func newScanFilter(c *config.Config, repo models.Repository, minModTime time.Time) *scanFilter {
	return &scanFilter{
		extensionConfig:   newExtensionConfig(c),
		txnManager:        repo.TxnManager,
		stashPaths:        c.GetStashPaths(),
		generatedPath:     c.GetGeneratedPath(),
		audioExcludeRegex: generateRegexps(c.GetAudioExcludes()),
		minModTime:        minModTime,
		stashIgnoreFilter: file.NewStashIgnoreFilter(),
	}
}

func (f *scanFilter) Accept(ctx context.Context, path string, info fs.FileInfo) bool {
	if fsutil.IsPathInDir(f.generatedPath, path) {
		logger.Warnf("Skipping %q as it overlaps with the generated folder", path)
		return false
	}

	// exit early on cutoff
	if info.Mode().IsRegular() && info.ModTime().Before(f.minModTime) {
		return false
	}

	s := f.stashPaths.GetStashFromDirPath(path)
	if s == nil {
		logger.Debugf("Skipping %s as it is not in the stash library", path)
		return false
	}

	// Check .stashignore files, bounded to the library root.
	if !f.stashIgnoreFilter.Accept(ctx, path, info, s.Path) {
		logger.Debugf("Skipping %s due to .stashignore", path)
		return false
	}

	isAudioFile := useAsAudio(path)

	if !info.IsDir() && !isAudioFile {
		logger.Debugf("Skipping %s as it does not match any known audio file extensions", path)
		return false
	}

	// #1756 - skip zero length files
	if !info.IsDir() && info.Size() == 0 {
		logger.Infof("Skipping zero-length file: %s", path)
		return false
	}

	if isAudioFile && (s.ExcludeAudio || matchFileRegex(path, f.audioExcludeRegex)) {
		logger.Debugf("Skipping %s as it matches audio exclusion patterns", path)
		return false
	}

	return true
}

func audioFileFilter(ctx context.Context, f models.File) bool {
	return isAudio(f.Base().Path)
}

func getScanHandlers(options ScanMetadataInput, taskQueue *job.TaskQueue, progress *job.Progress) []file.Handler {
	mgr := GetInstance()
	r := mgr.Repository
	pluginCache := mgr.PluginCache

	_ = taskQueue
	_ = progress
	_ = options

	return []file.Handler{
		&file.FilteredHandler{
			Filter: file.FilterFunc(audioFileFilter),
			Handler: &audio.ScanHandler{
				CreatorUpdater: r.Audio,
				CoverUpdater:   r.Audio,
				FFMpeg:         mgr.FFMpeg,
				PluginCache:    pluginCache,
				GroupAssigner:  r.Group,
				LibraryPaths:   mgr.Config.GetStashPaths().Paths(),
			},
		},
	}
}

// keep utils import used by scanFilter
var _ = utils.Timeout
