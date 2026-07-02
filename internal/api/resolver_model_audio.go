package api

import (
	"context"

	"github.com/stashapp/stash/internal/api/loaders"
	"github.com/stashapp/stash/internal/api/urlbuilders"
	"github.com/stashapp/stash/pkg/models"
)

func (r *audioResolver) getFiles(ctx context.Context, obj *models.Audio) ([]models.File, error) {
	fileIDs, err := loaders.From(ctx).AudioFiles.Load(obj.ID)
	if err != nil {
		return nil, err
	}

	files, errs := loaders.From(ctx).FileByID.LoadAll(fileIDs)
	return files, firstError(errs)
}

func (r *audioResolver) Files(ctx context.Context, obj *models.Audio) ([]*AudioFile, error) {
	files, err := r.getFiles(ctx, obj)
	if err != nil {
		return nil, err
	}

	var ret []*AudioFile
	for _, f := range files {
		af, ok := f.(*models.AudioFile)
		if !ok {
			continue
		}
		ret = append(ret, &AudioFile{AudioFile: af})
	}
	return ret, nil
}

func (r *audioResolver) Date(ctx context.Context, obj *models.Audio) (*string, error) {
	if obj.Date != nil {
		result := obj.Date.String()
		return &result, nil
	}
	return nil, nil
}

func (r *audioResolver) Rating100(ctx context.Context, obj *models.Audio) (*int, error) {
	return obj.Rating, nil
}

func (r *audioResolver) Paths(ctx context.Context, obj *models.Audio) (*AudioPathsType, error) {
	baseURL, _ := ctx.Value(BaseURLCtxKey).(string)
	builder := urlbuilders.NewAudioURLBuilder(baseURL, obj)
	coverPath := builder.GetCoverURL()
	streamPath := builder.GetStreamURL()
	vttPath := builder.GetVTTURL()
	return &AudioPathsType{
		Cover:  &coverPath,
		Stream: &streamPath,
		Vtt:    &vttPath,
	}, nil
}

func (r *audioResolver) Studio(ctx context.Context, obj *models.Audio) (ret *models.Studio, err error) {
	if obj.StudioID == nil {
		return nil, nil
	}
	return loaders.From(ctx).StudioByID.Load(*obj.StudioID)
}

func (r *audioResolver) Tags(ctx context.Context, obj *models.Audio) (ret []*models.Tag, err error) {
	if !obj.TagIDs.Loaded() {
		if err := r.withReadTxn(ctx, func(ctx context.Context) error {
			return obj.LoadTagIDs(ctx, r.repository.Audio)
		}); err != nil {
			return nil, err
		}
	}

	var errs []error
	ret, errs = loaders.From(ctx).TagByID.LoadAll(obj.TagIDs.List())
	return ret, firstError(errs)
}

func (r *audioResolver) Groups(ctx context.Context, obj *models.Audio) (ret []*models.Group, err error) {
	if !obj.GroupIDs.Loaded() {
		if err := r.withReadTxn(ctx, func(ctx context.Context) error {
			return obj.LoadGroupIDs(ctx, r.repository.Audio)
		}); err != nil {
			return nil, err
		}
	}

	var errs []error
	ret, errs = loaders.From(ctx).GroupByID.LoadAll(obj.GroupIDs.List())
	return ret, firstError(errs)
}

func (r *audioResolver) Performers(ctx context.Context, obj *models.Audio) (ret []*models.Performer, err error) {
	if !obj.PerformerIDs.Loaded() {
		if err := r.withReadTxn(ctx, func(ctx context.Context) error {
			return obj.LoadPerformerIDs(ctx, r.repository.Audio)
		}); err != nil {
			return nil, err
		}
	}

	var errs []error
	ret, errs = loaders.From(ctx).PerformerByID.LoadAll(obj.PerformerIDs.List())
	return ret, firstError(errs)
}

func (r *audioResolver) Urls(ctx context.Context, obj *models.Audio) ([]string, error) {
	if !obj.URLs.Loaded() {
		if err := r.withReadTxn(ctx, func(ctx context.Context) error {
			return obj.LoadURLs(ctx, r.repository.Audio)
		}); err != nil {
			return nil, err
		}
	}
	return obj.URLs.List(), nil
}

func (r *audioResolver) StashIds(ctx context.Context, obj *models.Audio) ([]*models.StashID, error) {
	if !obj.StashIDs.Loaded() {
		if err := r.withReadTxn(ctx, func(ctx context.Context) error {
			return obj.LoadStashIDs(ctx, r.repository.Audio)
		}); err != nil {
			return nil, err
		}
	}

	ids := obj.StashIDs.List()
	ret := make([]*models.StashID, len(ids))
	for i := range ids {
		ret[i] = &ids[i]
	}
	return ret, nil
}
