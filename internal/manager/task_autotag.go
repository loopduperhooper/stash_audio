package manager

import (
	"context"
	"fmt"
	"strconv"
	"sync"
	"time"

	"github.com/stashapp/stash_audio/internal/autotag"
	"github.com/stashapp/stash_audio/pkg/job"
	"github.com/stashapp/stash_audio/pkg/logger"
	"github.com/stashapp/stash_audio/pkg/match"
	"github.com/stashapp/stash_audio/pkg/models"
)

type autoTagJob struct {
	repository models.Repository
	input      AutoTagMetadataInput

	cache match.Cache
}

func (j *autoTagJob) Execute(ctx context.Context, progress *job.Progress) error {
	begin := time.Now()

	input := j.input
	if j.isFileBasedAutoTag(input) {
		j.autoTagFiles(ctx, progress, input.Paths, len(input.Performers) > 0, len(input.Studios) > 0, len(input.Tags) > 0)
	} else {
		j.autoTagSpecific(ctx, progress)
	}

	logger.Infof("Finished auto-tag after %s", time.Since(begin).String())
	return nil
}

func (j *autoTagJob) isFileBasedAutoTag(input AutoTagMetadataInput) bool {
	const wildcard = "*"
	performerIds := input.Performers
	studioIds := input.Studios
	tagIds := input.Tags

	return (len(performerIds) == 0 || performerIds[0] == wildcard) && (len(studioIds) == 0 || studioIds[0] == wildcard) && (len(tagIds) == 0 || tagIds[0] == wildcard)
}

func (j *autoTagJob) autoTagFiles(ctx context.Context, progress *job.Progress, paths []string, performers, studios, tags bool) {
	t := autoTagFilesTask{
		paths:      paths,
		performers: performers,
		studios:    studios,
		tags:       tags,
		progress:   progress,
		repository: j.repository,
		cache:      &j.cache,
	}

	t.process(ctx)
}

func (j *autoTagJob) autoTagSpecific(ctx context.Context, progress *job.Progress) {
	input := j.input
	performerIds := input.Performers
	studioIds := input.Studios
	tagIds := input.Tags

	performerCount := len(performerIds)
	studioCount := len(studioIds)
	tagCount := len(tagIds)

	r := j.repository
	if err := r.WithReadTxn(ctx, func(ctx context.Context) error {
		performerQuery := r.Performer
		studioQuery := r.Studio
		tagQuery := r.Tag

		const wildcard = "*"
		var err error
		if performerCount == 1 && performerIds[0] == wildcard {
			performerCount, err = performerQuery.Count(ctx)
			if err != nil {
				return fmt.Errorf("getting performer count: %v", err)
			}
		}
		if studioCount == 1 && studioIds[0] == wildcard {
			studioCount, err = studioQuery.Count(ctx)
			if err != nil {
				return fmt.Errorf("getting studio count: %v", err)
			}
		}
		if tagCount == 1 && tagIds[0] == wildcard {
			tagCount, err = tagQuery.Count(ctx)
			if err != nil {
				return fmt.Errorf("getting tag count: %v", err)
			}
		}

		return nil
	}); err != nil {
		if !job.IsCancelled(ctx) {
			logger.Errorf("auto-tag error: %v", err)
		}
		return
	}

	total := performerCount + studioCount + tagCount
	progress.SetTotal(total)

	logger.Infof("Starting auto-tag of %d performers, %d studios, %d tags", performerCount, studioCount, tagCount)

	j.autoTagPerformers(ctx, progress, input.Paths, performerIds)
	j.autoTagStudios(ctx, progress, input.Paths, studioIds)
	j.autoTagTags(ctx, progress, input.Paths, tagIds)
}

func (j *autoTagJob) autoTagPerformers(ctx context.Context, progress *job.Progress, paths []string, performerIds []string) {
	if job.IsCancelled(ctx) {
		return
	}

	r := j.repository
	tagger := autotag.Tagger{
		TxnManager: r.TxnManager,
		Cache:      &j.cache,
	}

	for _, performerId := range performerIds {
		var performers []*models.Performer

		if err := r.WithDB(ctx, func(ctx context.Context) error {
			performerQuery := r.Performer
			ignoreAutoTag := false
			perPage := -1

			if performerId == "*" {
				var err error
				performers, _, err = performerQuery.Query(ctx, &models.PerformerFilterType{
					IgnoreAutoTag: &ignoreAutoTag,
				}, &models.FindFilterType{
					PerPage: &perPage,
				})
				if err != nil {
					return fmt.Errorf("querying performers: %w", err)
				}
			} else {
				performerIdInt, err := strconv.Atoi(performerId)
				if err != nil {
					return fmt.Errorf("parsing performer id %s: %w", performerId, err)
				}

				performer, err := performerQuery.Find(ctx, performerIdInt)
				if err != nil {
					return fmt.Errorf("finding performer id %s: %w", performerId, err)
				}

				if performer == nil {
					return fmt.Errorf("performer with id %s not found", performerId)
				}

				if performer.IgnoreAutoTag {
					logger.Infof("Skipping performer %s because auto-tag is disabled", performer.Name)
					return nil
				}

				if err := performer.LoadAliases(ctx, r.Performer); err != nil {
					return fmt.Errorf("loading aliases for performer %d: %w", performer.ID, err)
				}
				performers = append(performers, performer)
			}

			for _, performer := range performers {
				if job.IsCancelled(ctx) {
					return nil
				}

				if err := tagger.PerformerAudios(ctx, performer, paths, r.Audio); err != nil {
					return fmt.Errorf("tagging performer '%s': %w", performer.Name, err)
				}

				progress.Increment()
			}

			return nil
		}); err != nil {
			logger.Errorf("auto-tag error: %v", err)
		}

		if job.IsCancelled(ctx) {
			logger.Info("Stopping performer auto-tag due to user request")
			return
		}
	}
}

func (j *autoTagJob) autoTagStudios(ctx context.Context, progress *job.Progress, paths []string, studioIds []string) {
	if job.IsCancelled(ctx) {
		return
	}

	r := j.repository
	tagger := autotag.Tagger{
		TxnManager: r.TxnManager,
		Cache:      &j.cache,
	}

	for _, studioId := range studioIds {
		var studios []*models.Studio

		if err := r.WithDB(ctx, func(ctx context.Context) error {
			studioQuery := r.Studio
			ignoreAutoTag := false
			perPage := -1
			if studioId == "*" {
				var err error
				studios, _, err = studioQuery.Query(ctx, &models.StudioFilterType{
					IgnoreAutoTag: &ignoreAutoTag,
				}, &models.FindFilterType{
					PerPage: &perPage,
				})
				if err != nil {
					return fmt.Errorf("querying studios: %v", err)
				}
			} else {
				studioIdInt, err := strconv.Atoi(studioId)
				if err != nil {
					return fmt.Errorf("parsing studio id %s: %s", studioId, err.Error())
				}

				studio, err := studioQuery.Find(ctx, studioIdInt)
				if err != nil {
					return fmt.Errorf("finding studio id %s: %s", studioId, err.Error())
				}

				if studio == nil {
					return fmt.Errorf("studio with id %s not found", studioId)
				}

				if studio.IgnoreAutoTag {
					logger.Infof("Skipping studio %s because auto-tag is disabled", studio.Name)
					return nil
				}

				studios = append(studios, studio)
			}

			for _, studio := range studios {
				if job.IsCancelled(ctx) {
					return nil
				}

				aliases, err := r.Studio.GetAliases(ctx, studio.ID)
				if err != nil {
					return fmt.Errorf("getting studio aliases: %w", err)
				}

				if err := tagger.StudioAudios(ctx, studio, paths, aliases, r.Audio); err != nil {
					return fmt.Errorf("tagging studio '%s': %w", studio.Name, err)
				}

				progress.Increment()
			}

			return nil
		}); err != nil {
			logger.Errorf("auto-tag error: %v", err)
		}

		if job.IsCancelled(ctx) {
			logger.Info("Stopping studio auto-tag due to user request")
			return
		}
	}
}

func (j *autoTagJob) autoTagTags(ctx context.Context, progress *job.Progress, paths []string, tagIds []string) {
	if job.IsCancelled(ctx) {
		return
	}

	r := j.repository
	tagger := autotag.Tagger{
		TxnManager: r.TxnManager,
		Cache:      &j.cache,
	}

	for _, tagId := range tagIds {
		var tags []*models.Tag
		if err := r.WithDB(ctx, func(ctx context.Context) error {
			tagQuery := r.Tag
			ignoreAutoTag := false
			perPage := -1
			if tagId == "*" {
				var err error
				tags, _, err = tagQuery.Query(ctx, &models.TagFilterType{
					IgnoreAutoTag: &ignoreAutoTag,
				}, &models.FindFilterType{
					PerPage: &perPage,
				})
				if err != nil {
					return fmt.Errorf("querying tags: %v", err)
				}
			} else {
				tagIdInt, err := strconv.Atoi(tagId)
				if err != nil {
					return fmt.Errorf("parsing tag id %s: %s", tagId, err.Error())
				}

				tag, err := tagQuery.Find(ctx, tagIdInt)
				if err != nil {
					return fmt.Errorf("finding tag id %s: %s", tagId, err.Error())
				}

				if tag == nil {
					return fmt.Errorf("tag with id %s not found", tagId)
				}

				if tag.IgnoreAutoTag {
					logger.Infof("Skipping tag %s because auto-tag is disabled", tag.Name)
					return nil
				}

				tags = append(tags, tag)
			}

			for _, tag := range tags {
				if job.IsCancelled(ctx) {
					return nil
				}

				aliases, err := r.Tag.GetAliases(ctx, tag.ID)
				if err != nil {
					return fmt.Errorf("getting tag aliases: %w", err)
				}

				if err := tagger.TagAudios(ctx, tag, paths, aliases, r.Audio); err != nil {
					return fmt.Errorf("tagging tag '%s': %w", tag.Name, err)
				}

				progress.Increment()
			}

			return nil
		}); err != nil {
			logger.Errorf("auto-tag error: %v", err)
		}

		if job.IsCancelled(ctx) {
			logger.Info("Stopping tag auto-tag due to user request")
			return
		}
	}
}

type autoTagFilesTask struct {
	paths      []string
	performers bool
	studios    bool
	tags       bool

	progress   *job.Progress
	repository models.Repository
	cache      *match.Cache
}

func (t *autoTagFilesTask) getCount(ctx context.Context) (int, error) {
	r := t.repository

	pp := 0
	findFilter := &models.FindFilterType{
		PerPage: &pp,
	}

	audioResults, err := r.Audio.Query(ctx, models.AudioQueryOptions{
		QueryOptions: models.QueryOptions{
			FindFilter: findFilter,
			Count:      true,
		},
	})
	if err != nil {
		return 0, fmt.Errorf("getting audio count: %w", err)
	}

	return audioResults.Count, nil
}

func (t *autoTagFilesTask) processAudios(ctx context.Context) {
	if job.IsCancelled(ctx) {
		return
	}

	logger.Info("Auto-tagging audios...")

	batchSize := 1000

	findFilter := models.BatchFindFilter(batchSize)

	r := t.repository

	more := true
	for more {
		var audios []*models.Audio
		if err := r.WithReadTxn(ctx, func(ctx context.Context) error {
			var err error
			audios, err = r.Audio.All(ctx)
			return err
		}); err != nil {
			if !job.IsCancelled(ctx) {
				logger.Errorf("error querying audios for auto-tag: %v", err)
			}
			return
		}

		for _, a := range audios {
			if job.IsCancelled(ctx) {
				logger.Info("Stopping auto-tag due to user request")
				return
			}

			tt := autoTagAudioTask{
				repository: r,
				audio:      a,
				performers: t.performers,
				studios:    t.studios,
				tags:       t.tags,
				cache:      t.cache,
			}

			var wg sync.WaitGroup
			wg.Add(1)
			go tt.Start(ctx, &wg)
			wg.Wait()

			t.progress.Increment()
		}

		if len(audios) != batchSize {
			more = false
		} else {
			*findFilter.Page++
		}
	}
}

func (t *autoTagFilesTask) process(ctx context.Context) {
	if err := t.repository.WithReadTxn(ctx, func(ctx context.Context) error {
		total, err := t.getCount(ctx)
		if err != nil {
			return err
		}

		t.progress.SetTotal(total)
		logger.Infof("Starting auto-tag of %d files", total)

		return nil
	}); err != nil {
		if !job.IsCancelled(ctx) {
			logger.Errorf("error getting file count for auto-tag task: %v", err)
		}
		return
	}

	t.processAudios(ctx)
}

type autoTagAudioTask struct {
	repository models.Repository
	audio      *models.Audio

	performers bool
	studios    bool
	tags       bool

	cache *match.Cache
}

func (t *autoTagAudioTask) Start(ctx context.Context, wg *sync.WaitGroup) {
	defer wg.Done()
	r := t.repository
	tagger := autotag.Tagger{
		TxnManager: r.TxnManager,
		Cache:      t.cache,
	}

	if err := r.WithTxn(ctx, func(ctx context.Context) error {
		if t.audio.Path == "" {
			return nil
		}

		if t.performers {
			if err := autotag.AudioPerformers(ctx, t.audio, r.Audio, r.Performer, t.cache); err != nil {
				return fmt.Errorf("tagging audio performers for %s: %v", t.audio.DisplayName(), err)
			}
		}
		if t.studios {
			if err := autotag.AudioStudios(ctx, t.audio, r.Audio, r.Studio, &tagger); err != nil {
				return fmt.Errorf("tagging audio studio for %s: %v", t.audio.DisplayName(), err)
			}
		}
		if t.tags {
			if err := autotag.AudioTags(ctx, t.audio, r.Audio, r.Tag, t.cache); err != nil {
				return fmt.Errorf("tagging audio tags for %s: %v", t.audio.DisplayName(), err)
			}
		}

		return nil
	}); err != nil {
		if !job.IsCancelled(ctx) {
			logger.Errorf("auto-tag error: %v", err)
		}
	}
}
