// Package manager provides the core manager of the application.
// This consolidates all the services and managers into a single struct.
package manager

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"github.com/remeh/sizedwaitgroup"
	"github.com/stashapp/stash_audio/internal/log"
	"github.com/stashapp/stash_audio/internal/manager/config"
	"github.com/stashapp/stash_audio/pkg/ffmpeg"
	"github.com/stashapp/stash_audio/pkg/fsutil"
	"github.com/stashapp/stash_audio/pkg/job"
	"github.com/stashapp/stash_audio/pkg/logger"
	"github.com/stashapp/stash_audio/pkg/models"
	"github.com/stashapp/stash_audio/pkg/models/paths"
	"github.com/stashapp/stash_audio/pkg/pkg"
	"github.com/stashapp/stash_audio/pkg/plugin"
	"github.com/stashapp/stash_audio/pkg/session"
	"github.com/stashapp/stash_audio/pkg/sqlite"

	// register custom migrations
	_ "github.com/stashapp/stash_audio/pkg/sqlite/migrations"
)

type Manager struct {
	Config *config.Config
	Logger *log.Logger

	// ImageThumbnailGenerateWaitGroup is the global wait group for cover art generation
	ImageThumbnailGenerateWaitGroup sizedwaitgroup.SizedWaitGroup

	Paths *paths.Paths

	FFMpeg        *ffmpeg.FFMpeg
	FFProbe       *ffmpeg.FFProbe
	StreamManager *ffmpeg.StreamManager

	JobManager      *job.Manager
	ReadLockManager *fsutil.ReadLockManager

	DownloadStore *DownloadStore
	SessionStore  *session.Store

	PluginCache *plugin.Cache

	PluginPackageManager *pkg.Manager

	Database   *sqlite.Database
	Repository models.Repository

	GroupService GroupService

	scanSubs *subscriptionManager
}

var instance *Manager

func GetInstance() *Manager {
	if instance == nil {
		panic("manager not initialized")
	}
	return instance
}

func (s *Manager) SetBlobStoreOptions() {
	storageType := s.Config.GetBlobsStorage()
	blobsPath := s.Config.GetBlobsPath()
	extraBlobsPaths := s.Config.GetExtraBlobsPaths()

	s.Database.SetBlobStoreOptions(sqlite.BlobStoreOptions{
		UseFilesystem:      storageType == config.BlobStorageTypeFilesystem,
		UseDatabase:        storageType == config.BlobStorageTypeDatabase,
		Path:               blobsPath,
		SupplementaryPaths: extraBlobsPaths,
	})
}

func (s *Manager) RefreshConfig() {
	cfg := s.Config
	*s.Paths = paths.NewPaths(cfg.GetGeneratedPath(), cfg.GetBlobsPath())
	if cfg.Validate() == nil {
		if err := fsutil.EnsureDir(s.Paths.Generated.Downloads); err != nil {
			logger.Warnf("could not create downloads directory: %v", err)
		}

		s.ImageThumbnailGenerateWaitGroup.Size = cfg.GetParallelTasksWithAutoDetection()
	}
}

// RefreshPluginCache refreshes the plugin cache.
// Call this when the plugin configuration changes.
func (s *Manager) RefreshPluginCache() {
	s.PluginCache.ReloadPlugins()
}

// RefreshStreamManager refreshes the stream manager.
// Call this when the cache directory changes.
func (s *Manager) RefreshStreamManager() {
	// shutdown existing manager if needed
	if s.StreamManager != nil {
		s.StreamManager.Shutdown()
		s.StreamManager = nil
	}

	cfg := s.Config
	cacheDir := cfg.GetCachePath()
	s.StreamManager = ffmpeg.NewStreamManager(cacheDir, s.FFMpeg, s.FFProbe, cfg, s.ReadLockManager)
}

func createPackageManager(localPath string, srcPathGetter pkg.SourcePathGetter) *pkg.Manager {
	const timeout = 10 * time.Second
	httpClient := &http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyFromEnvironment,
		},
		Timeout: timeout,
	}

	return &pkg.Manager{
		Local: &pkg.Store{
			BaseDir:      localPath,
			ManifestFile: pkg.ManifestFile,
		},
		PackagePathGetter: srcPathGetter,
		Client:            httpClient,
	}
}

func (s *Manager) RefreshPluginSourceManager() {
	s.PluginPackageManager = createPackageManager(s.Config.GetPluginsPath(), s.Config.GetPluginPackagePathGetter())
}

func setSetupDefaults(input *SetupInput) {
	if input.ConfigLocation == "" {
		input.ConfigLocation = filepath.Join(fsutil.GetHomeDirectory(), ".stash_audio", "config.yml")
	}

	configDir := filepath.Dir(input.ConfigLocation)
	if input.GeneratedLocation == "" {
		input.GeneratedLocation = filepath.Join(configDir, "generated")
	}
	if input.CacheLocation == "" {
		input.CacheLocation = filepath.Join(configDir, "cache")
	}

	if input.DatabaseFile == "" {
		input.DatabaseFile = filepath.Join(configDir, "stash_audio.sqlite")
	}

	if input.BlobsLocation == "" {
		input.BlobsLocation = filepath.Join(configDir, "blobs")
	}
}

func (s *Manager) Setup(ctx context.Context, input SetupInput) error {
	setSetupDefaults(&input)
	cfg := s.Config

	// create the config directory if it does not exist
	// don't do anything if config is already set in the environment
	if !config.FileEnvSet() {
		configFile := input.ConfigLocation
		configDir := filepath.Dir(configFile)

		if exists, _ := fsutil.DirExists(configDir); !exists {
			if err := os.MkdirAll(configDir, 0755); err != nil {
				return fmt.Errorf("error creating config directory: %v", err)
			}
		}

		if err := fsutil.Touch(configFile); err != nil {
			return fmt.Errorf("error creating config file: %v", err)
		}

		s.Config.SetConfigFile(configFile)
	}

	if err := cfg.SetInitialConfig(); err != nil {
		return fmt.Errorf("error setting initial configuration: %w", err)
	}

	// create the generated directory if it does not exist
	if !cfg.HasOverride(config.Generated) {
		if exists, _ := fsutil.DirExists(input.GeneratedLocation); !exists {
			if err := os.MkdirAll(input.GeneratedLocation, 0755); err != nil {
				return fmt.Errorf("error creating generated directory: %v", err)
			}
		}

		s.Config.SetString(config.Generated, input.GeneratedLocation)
	}

	// create the cache directory if it does not exist
	if !cfg.HasOverride(config.Cache) {
		if exists, _ := fsutil.DirExists(input.CacheLocation); !exists {
			if err := os.MkdirAll(input.CacheLocation, 0755); err != nil {
				return fmt.Errorf("error creating cache directory: %v", err)
			}
		}

		cfg.SetString(config.Cache, input.CacheLocation)
	}

	if input.SFWContentMode {
		cfg.SetBool(config.SFWContentMode, true)
	}

	if input.StoreBlobsInDatabase {
		cfg.SetInterface(config.BlobsStorage, config.BlobStorageTypeDatabase)
	} else {
		if !cfg.HasOverride(config.BlobsPath) {
			if exists, _ := fsutil.DirExists(input.BlobsLocation); !exists {
				if err := os.MkdirAll(input.BlobsLocation, 0755); err != nil {
					return fmt.Errorf("error creating blobs directory: %v", err)
				}
			}

			cfg.SetString(config.BlobsPath, input.BlobsLocation)
		}

		cfg.SetInterface(config.BlobsStorage, config.BlobStorageTypeFilesystem)
	}

	// set the configuration
	if !cfg.HasOverride(config.Database) {
		cfg.SetString(config.Database, input.DatabaseFile)
	}

	cfg.SetInterface(config.Stash, input.Stashes)

	if err := cfg.Write(); err != nil {
		return fmt.Errorf("error writing configuration file: %w", err)
	}

	// finish initialization
	if err := s.postInit(ctx); err != nil {
		return fmt.Errorf("error completing initialization: %w", err)
	}

	cfg.FinalizeSetup()

	return nil
}

func (s *Manager) validateFFmpeg() error {
	if s.FFMpeg == nil || s.FFProbe == nil {
		return errors.New("missing ffmpeg and/or ffprobe")
	}
	return nil
}

func (s *Manager) AnonymiseDatabase(download bool) (string, string, error) {
	var outPath string
	var outName string
	if download {
		outDir := s.Paths.Generated.Downloads
		if err := fsutil.EnsureDir(outDir); err != nil {
			return "", "", fmt.Errorf("could not create output directory %v: %w", outDir, err)
		}
		f, err := os.CreateTemp(outDir, "anonymous*.sqlite")
		if err != nil {
			return "", "", err
		}

		outPath = f.Name()
		outName = s.Database.AnonymousDatabasePath("")
		f.Close()
	} else {
		outDir := s.Config.GetBackupDirectoryPathOrDefault()
		if outDir != "" {
			if err := fsutil.EnsureDir(outDir); err != nil {
				return "", "", fmt.Errorf("could not create output directory %v: %w", outDir, err)
			}
		}
		outPath = s.Database.AnonymousDatabasePath(outDir)
		outName = filepath.Base(outPath)
	}

	err := s.Database.Anonymise(outPath)
	if err != nil {
		return "", "", err
	}

	return outPath, outName, nil
}

func (s *Manager) GetSystemStatus() *SystemStatus {
	workingDir := fsutil.GetWorkingDirectory()
	homeDir := fsutil.GetHomeDirectory()

	database := s.Database
	dbSchema := int(database.Version())
	dbPath := database.DatabasePath()
	appSchema := int(database.AppSchemaVersion())

	status := SystemStatusEnumOk
	if s.Config.IsNewSystem() {
		status = SystemStatusEnumSetup
	} else if dbSchema < appSchema {
		status = SystemStatusEnumNeedsMigration
	}

	configFile := s.Config.GetConfigFile()

	ffmpegPath := ""
	if s.FFMpeg != nil {
		ffmpegPath = s.FFMpeg.Path()
	}

	ffprobePath := ""
	if s.FFProbe != nil {
		ffprobePath = s.FFProbe.Path()
	}

	return &SystemStatus{
		Os:             runtime.GOOS,
		WorkingDir:     workingDir,
		HomeDir:        homeDir,
		DatabaseSchema: &dbSchema,
		DatabasePath:   &dbPath,
		AppSchema:      appSchema,
		Status:         status,
		ConfigPath:     &configFile,
		FfmpegPath:     &ffmpegPath,
		FfprobePath:    &ffprobePath,
	}
}

// Shutdown gracefully stops the manager
func (s *Manager) Shutdown() {
	if s.StreamManager != nil {
		s.StreamManager.Shutdown()
		s.StreamManager = nil
	}

	err := s.Database.Close()
	if err != nil {
		logger.Errorf("Error closing database: %s", err)
	}
}
