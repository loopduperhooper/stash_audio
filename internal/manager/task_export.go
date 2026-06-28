package manager

import (
	"archive/zip"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"sync"
	"time"

	"github.com/stashapp/stash_audio/internal/manager/config"
	"github.com/stashapp/stash_audio/pkg/fsutil"
	"github.com/stashapp/stash_audio/pkg/group"
	"github.com/stashapp/stash_audio/pkg/logger"
	"github.com/stashapp/stash_audio/pkg/models"
	"github.com/stashapp/stash_audio/pkg/models/jsonschema"
	"github.com/stashapp/stash_audio/pkg/models/paths"
	"github.com/stashapp/stash_audio/pkg/performer"
	"github.com/stashapp/stash_audio/pkg/savedfilter"
	"github.com/stashapp/stash_audio/pkg/sliceutil"
	"github.com/stashapp/stash_audio/pkg/sliceutil/stringslice"
	"github.com/stashapp/stash_audio/pkg/studio"
	"github.com/stashapp/stash_audio/pkg/tag"
)

type ExportTask struct {
	repository models.Repository
	full       bool

	baseDir string
	json    jsonUtils

	fileNamingAlgorithm models.HashAlgorithm

	performers *exportSpec
	groups     *exportSpec
	tags       *exportSpec
	studios    *exportSpec

	includeDependencies bool

	DownloadHash string
}

type ExportObjectTypeInput struct {
	Ids []string `json:"ids"`
	All *bool    `json:"all"`
}

type ExportObjectsInput struct {
	Studios             *ExportObjectTypeInput `json:"studios"`
	Performers          *ExportObjectTypeInput `json:"performers"`
	Tags                *ExportObjectTypeInput `json:"tags"`
	Groups              *ExportObjectTypeInput `json:"groups"`
	Movies              *ExportObjectTypeInput `json:"movies"` // deprecated alias for Groups
	IncludeDependencies *bool                  `json:"includeDependencies"`
}

type exportSpec struct {
	IDs []int
	all bool
}

func newExportSpec(input *ExportObjectTypeInput) *exportSpec {
	if input == nil {
		return &exportSpec{}
	}

	ids, _ := stringslice.StringSliceToIntSlice(input.Ids)

	ret := &exportSpec{
		IDs: ids,
	}

	if input.All != nil {
		ret.all = *input.All
	}

	return ret
}

func CreateExportTask(a models.HashAlgorithm, input ExportObjectsInput) *ExportTask {
	includeDeps := false
	if input.IncludeDependencies != nil {
		includeDeps = *input.IncludeDependencies
	}

	// handle deprecated Movies field
	groupSpec := input.Groups
	if groupSpec == nil && input.Movies != nil {
		groupSpec = input.Movies
	}

	return &ExportTask{
		repository:          GetInstance().Repository,
		fileNamingAlgorithm: a,
		performers:          newExportSpec(input.Performers),
		groups:              newExportSpec(groupSpec),
		tags:                newExportSpec(input.Tags),
		studios:             newExportSpec(input.Studios),
		includeDependencies: includeDeps,
	}
}

func (t *ExportTask) Start(ctx context.Context, wg *sync.WaitGroup) {
	defer wg.Done()
	workerCount := runtime.GOMAXPROCS(0)

	startTime := time.Now()

	if t.full {
		t.baseDir = config.GetInstance().GetMetadataPath()
	} else {
		var err error
		t.baseDir, err = instance.Paths.Generated.TempDir("export")
		if err != nil {
			logger.Errorf("error creating temporary directory for export: %v", err)
			return
		}

		defer func() {
			err := fsutil.RemoveDir(t.baseDir)
			if err != nil {
				logger.Errorf("error removing directory %s: %v", t.baseDir, err)
			}
		}()
	}

	if t.baseDir == "" {
		logger.Errorf("baseDir must not be empty")
		return
	}

	t.json = jsonUtils{
		json: *paths.GetJSONPaths(t.baseDir),
	}

	paths.EmptyJSONDirs(t.baseDir)
	paths.EnsureJSONDirs(t.baseDir)

	txnErr := t.repository.WithTxn(ctx, func(ctx context.Context) error {
		t.ExportGroups(ctx, workerCount)
		t.ExportPerformers(ctx, workerCount)
		t.ExportStudios(ctx, workerCount)
		t.ExportTags(ctx, workerCount)
		t.ExportSavedFilters(ctx, workerCount)

		return nil
	})
	if txnErr != nil {
		logger.Warnf("error while running export transaction: %v", txnErr)
	}

	if !t.full {
		err := t.generateDownload()
		if err != nil {
			logger.Errorf("error generating download link: %v", err)
			return
		}
	}
	logger.Infof("Export complete in %s.", time.Since(startTime))
}

func (t *ExportTask) generateDownload() error {
	if err := fsutil.EnsureDir(instance.Paths.Generated.Downloads); err != nil {
		return err
	}
	z, err := os.CreateTemp(instance.Paths.Generated.Downloads, "export*.zip")
	if err != nil {
		return err
	}
	defer z.Close()

	err = t.zipFiles(z)
	if err != nil {
		return err
	}

	t.DownloadHash, err = instance.DownloadStore.RegisterFile(z.Name(), "", false)
	if err != nil {
		return fmt.Errorf("error registering file for download: %w", err)
	}
	logger.Debugf("Generated zip file %s with hash %s", z.Name(), t.DownloadHash)
	return nil
}

func (t *ExportTask) zipFiles(w io.Writer) error {
	z := zip.NewWriter(w)
	defer z.Close()

	u := jsonUtils{
		json: *paths.GetJSONPaths(""),
	}

	walkWarn(t.json.json.Tags, t.zipWalkFunc(u.json.Tags, z))
	walkWarn(t.json.json.Performers, t.zipWalkFunc(u.json.Performers, z))
	walkWarn(t.json.json.Studios, t.zipWalkFunc(u.json.Studios, z))
	walkWarn(t.json.json.Groups, t.zipWalkFunc(u.json.Groups, z))

	return nil
}

// like filepath.Walk but issue a warning on error
func walkWarn(root string, fn filepath.WalkFunc) {
	if err := filepath.Walk(root, fn); err != nil {
		logger.Warnf("error walking structure %v: %v", root, err)
	}
}

func (t *ExportTask) zipWalkFunc(outDir string, z *zip.Writer) filepath.WalkFunc {
	return func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return nil
		}

		return t.zipFile(path, outDir, z)
	}
}

func (t *ExportTask) zipFile(fn, outDir string, z *zip.Writer) error {
	bn := filepath.Base(fn)

	p := filepath.Join(outDir, bn)
	p = filepath.ToSlash(p)

	f, err := z.Create(p)
	if err != nil {
		return fmt.Errorf("error creating zip entry for %s: %v", fn, err)
	}

	i, err := os.Open(fn)
	if err != nil {
		return fmt.Errorf("error opening %s: %v", fn, err)
	}

	defer i.Close()

	if _, err := io.Copy(f, i); err != nil {
		return fmt.Errorf("error writing %s to zip: %v", fn, err)
	}

	return nil
}

func (t *ExportTask) ExportPerformers(ctx context.Context, workers int) {
	var performersWg sync.WaitGroup

	reader := t.repository.Performer
	var performers []*models.Performer
	var err error
	all := t.full || (t.performers != nil && t.performers.all)
	if all {
		performers, err = reader.All(ctx)
	} else if t.performers != nil && len(t.performers.IDs) > 0 {
		performers, err = reader.FindMany(ctx, t.performers.IDs)
	}

	if err != nil {
		logger.Errorf("[performers] failed to fetch performers: %v", err)
	}
	jobCh := make(chan *models.Performer, workers*2)

	logger.Info("[performers] exporting")
	startTime := time.Now()

	for w := 0; w < workers; w++ {
		performersWg.Add(1)
		go t.exportPerformer(ctx, &performersWg, jobCh)
	}

	for i, p := range performers {
		logger.Progressf("[performers] %d of %d", i+1, len(performers))
		jobCh <- p
	}

	close(jobCh)
	performersWg.Wait()

	logger.Infof("[performers] export complete in %s. %d workers used.", time.Since(startTime), workers)
}

func (t *ExportTask) exportPerformer(ctx context.Context, wg *sync.WaitGroup, jobChan <-chan *models.Performer) {
	defer wg.Done()

	r := t.repository
	performerReader := r.Performer

	for p := range jobChan {
		newPerformerJSON, err := performer.ToJSON(ctx, performerReader, p)
		if err != nil {
			logger.Errorf("[performers] <%s> error getting performer JSON: %v", p.Name, err)
			continue
		}

		tags, err := r.Tag.FindByPerformerID(ctx, p.ID)
		if err != nil {
			logger.Errorf("[performers] <%s> error getting performer tags: %v", p.Name, err)
			continue
		}

		newPerformerJSON.Tags = tag.GetNames(tags)

		if t.includeDependencies {
			t.tags.IDs = sliceutil.AppendUniques(t.tags.IDs, tag.GetIDs(tags))
		}

		fn := newPerformerJSON.Filename()
		if err := t.json.savePerformer(fn, newPerformerJSON); err != nil {
			logger.Errorf("[performers] <%s> failed to save json: %v", p.Name, err)
		}
	}
}

func (t *ExportTask) ExportStudios(ctx context.Context, workers int) {
	var studiosWg sync.WaitGroup

	reader := t.repository.Studio
	var studios []*models.Studio
	var err error
	all := t.full || (t.studios != nil && t.studios.all)
	if all {
		studios, err = reader.All(ctx)
	} else if t.studios != nil && len(t.studios.IDs) > 0 {
		studios, err = reader.FindMany(ctx, t.studios.IDs)
	}

	if err != nil {
		logger.Errorf("[studios] failed to fetch studios: %v", err)
	}

	logger.Info("[studios] exporting")
	startTime := time.Now()

	jobCh := make(chan *models.Studio, workers*2)

	for w := 0; w < workers; w++ {
		studiosWg.Add(1)
		go t.exportStudio(ctx, &studiosWg, jobCh)
	}

	for i, s := range studios {
		logger.Progressf("[studios] %d of %d", i+1, len(studios))
		jobCh <- s
	}

	close(jobCh)
	studiosWg.Wait()

	logger.Infof("[studios] export complete in %s. %d workers used.", time.Since(startTime), workers)
}

func (t *ExportTask) exportStudio(ctx context.Context, wg *sync.WaitGroup, jobChan <-chan *models.Studio) {
	defer wg.Done()

	r := t.repository
	studioReader := t.repository.Studio

	for s := range jobChan {
		newStudioJSON, err := studio.ToJSON(ctx, studioReader, s)
		if err != nil {
			logger.Errorf("[studios] <%s> error getting studio JSON: %v", s.Name, err)
			continue
		}

		tags, err := r.Tag.FindByStudioID(ctx, s.ID)
		if err != nil {
			logger.Errorf("[studios] <%s> error getting studio tags: %s", s.Name, err.Error())
			continue
		}

		newStudioJSON.Tags = tag.GetNames(tags)

		if t.includeDependencies {
			t.tags.IDs = sliceutil.AppendUniques(t.tags.IDs, tag.GetIDs(tags))
		}

		fn := newStudioJSON.Filename()
		if err := t.json.saveStudio(fn, newStudioJSON); err != nil {
			logger.Errorf("[studios] <%s> failed to save json: %v", s.Name, err)
		}
	}
}

func (t *ExportTask) ExportTags(ctx context.Context, workers int) {
	var tagsWg sync.WaitGroup

	reader := t.repository.Tag
	var tags []*models.Tag
	var err error
	all := t.full || (t.tags != nil && t.tags.all)
	if all {
		tags, err = reader.All(ctx)
	} else if t.tags != nil && len(t.tags.IDs) > 0 {
		tags, err = reader.FindMany(ctx, t.tags.IDs)
	}

	if err != nil {
		logger.Errorf("[tags] failed to fetch tags: %v", err)
	}

	logger.Info("[tags] exporting")
	startTime := time.Now()

	tagIdx := 0
	if t.tags != nil {
		tagIdx = len(t.tags.IDs)
	}

	for {
		jobCh := make(chan *models.Tag, workers*2)

		for w := 0; w < workers; w++ {
			tagsWg.Add(1)
			go t.exportTag(ctx, &tagsWg, jobCh)
		}

		for i, thisTag := range tags {
			logger.Progressf("[tags] %d of %d", i+1+tagIdx, len(tags)+tagIdx)
			jobCh <- thisTag
		}

		close(jobCh)
		tagsWg.Wait()

		if t.tags == nil || len(t.tags.IDs) == tagIdx {
			break
		}

		newTags, err := reader.FindMany(ctx, t.tags.IDs[tagIdx:])
		if err != nil {
			logger.Errorf("[tags] failed to fetch tags: %v", err)
		}

		tags = newTags
		tagIdx = len(t.tags.IDs)
	}

	logger.Infof("[tags] export complete in %s. %d workers used.", time.Since(startTime), workers)
}

func (t *ExportTask) exportTag(ctx context.Context, wg *sync.WaitGroup, jobChan <-chan *models.Tag) {
	defer wg.Done()

	tagReader := t.repository.Tag

	for thisTag := range jobChan {
		newTagJSON, err := tag.ToJSON(ctx, tagReader, thisTag)
		if err != nil {
			logger.Errorf("[tags] <%s> error getting tag JSON: %v", thisTag.Name, err)
			continue
		}

		if t.includeDependencies {
			tagIDs, err := tag.GetDependentTagIDs(ctx, tagReader, thisTag)
			if err != nil {
				logger.Errorf("[tags] <%s> error getting dependent tags: %v", thisTag.Name, err)
				continue
			}
			t.tags.IDs = sliceutil.AppendUniques(t.tags.IDs, tagIDs)
		}

		fn := newTagJSON.Filename()
		if err := t.json.saveTag(fn, newTagJSON); err != nil {
			logger.Errorf("[tags] <%s> failed to save json: %v", fn, err)
		}
	}
}

func (t *ExportTask) ExportGroups(ctx context.Context, workers int) {
	var groupsWg sync.WaitGroup

	reader := t.repository.Group
	var groups []*models.Group
	var err error
	all := t.full || (t.groups != nil && t.groups.all)
	if all {
		groups, err = reader.All(ctx)
	} else if t.groups != nil && len(t.groups.IDs) > 0 {
		groups, err = reader.FindMany(ctx, t.groups.IDs)
	}

	if err != nil {
		logger.Errorf("[groups] failed to fetch groups: %v", err)
	}

	logger.Info("[groups] exporting")
	startTime := time.Now()

	jobCh := make(chan *models.Group, workers*2)

	for w := 0; w < workers; w++ {
		groupsWg.Add(1)
		go t.exportGroup(ctx, &groupsWg, jobCh)
	}

	for i, g := range groups {
		logger.Progressf("[groups] %d of %d", i+1, len(groups))
		jobCh <- g
	}

	close(jobCh)
	groupsWg.Wait()

	logger.Infof("[groups] export complete in %s. %d workers used.", time.Since(startTime), workers)
}

func (t *ExportTask) exportGroup(ctx context.Context, wg *sync.WaitGroup, jobChan <-chan *models.Group) {
	defer wg.Done()

	r := t.repository
	groupReader := r.Group
	studioReader := r.Studio
	tagReader := r.Tag

	for m := range jobChan {
		if err := m.LoadURLs(ctx, r.Group); err != nil {
			logger.Errorf("[groups] <%s> error getting group urls: %v", m.Name, err)
			continue
		}
		if err := m.LoadSubGroupIDs(ctx, r.Group); err != nil {
			logger.Errorf("[groups] <%s> error getting group sub-groups: %v", m.Name, err)
			continue
		}

		newGroupJSON, err := group.ToJSON(ctx, groupReader, studioReader, m)
		if err != nil {
			logger.Errorf("[groups] <%s> error getting group JSON: %v", m.Name, err)
			continue
		}

		tags, err := tagReader.FindByGroupID(ctx, m.ID)
		if err != nil {
			logger.Errorf("[groups] <%s> error getting group tags: %v", m.Name, err)
			continue
		}

		newGroupJSON.Tags = tag.GetNames(tags)

		subGroups := m.SubGroups.List()
		if err := func() error {
			for _, sg := range subGroups {
				subGroup, err := groupReader.Find(ctx, sg.GroupID)
				if err != nil {
					return fmt.Errorf("error getting sub group: %v", err)
				}

				newGroupJSON.SubGroups = append(newGroupJSON.SubGroups, jsonschema.SubGroupDescription{
					Group:       subGroup.Name,
					Description: sg.Description,
				})
			}
			return nil
		}(); err != nil {
			logger.Errorf("[groups] <%s> %v", m.Name, err)
		}

		if t.includeDependencies {
			if m.StudioID != nil {
				t.studios.IDs = sliceutil.AppendUnique(t.studios.IDs, *m.StudioID)
			}
		}

		fn := newGroupJSON.Filename()
		if err := t.json.saveGroup(fn, newGroupJSON); err != nil {
			logger.Errorf("[groups] <%s> failed to save json: %v", m.Name, err)
		}
	}
}

func (t *ExportTask) ExportSavedFilters(ctx context.Context, workers int) {
	if !t.full {
		return
	}

	var wg sync.WaitGroup

	reader := t.repository.SavedFilter
	filters, err := reader.All(ctx)
	if err != nil {
		logger.Errorf("[saved filters] failed to fetch saved filters: %v", err)
	}

	logger.Info("[saved filters] exporting")
	startTime := time.Now()

	jobCh := make(chan *models.SavedFilter, workers*2)

	for w := 0; w < workers; w++ {
		wg.Add(1)
		go t.exportSavedFilter(ctx, &wg, jobCh)
	}

	for i, f := range filters {
		logger.Progressf("[saved filters] %d of %d", i+1, len(filters))
		jobCh <- f
	}

	close(jobCh)
	wg.Wait()

	logger.Infof("[saved filters] export complete in %s. %d workers used.", time.Since(startTime), workers)
}

func (t *ExportTask) exportSavedFilter(ctx context.Context, wg *sync.WaitGroup, jobChan <-chan *models.SavedFilter) {
	defer wg.Done()

	for thisFilter := range jobChan {
		newJSON, err := savedfilter.ToJSON(ctx, thisFilter)
		if err != nil {
			logger.Errorf("[saved filter] <%s> error getting saved filter JSON: %v", thisFilter.Name, err)
			continue
		}

		fn := newJSON.Filename()
		if err := t.json.saveSavedFilter(fn, newJSON); err != nil {
			logger.Errorf("[saved filter] <%s> failed to save json: %v", fn, err)
		}
	}
}
