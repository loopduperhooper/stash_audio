// Package loaders contains the dataloaders used by the resolver in [api].
// They are generated with `make generate-dataloaders`.
// The dataloaders are used to batch requests to the database.

//go:generate go run github.com/vektah/dataloaden PerformerLoader int *github.com/stashapp/stash_audio/pkg/models.Performer
//go:generate go run github.com/vektah/dataloaden StudioLoader int *github.com/stashapp/stash_audio/pkg/models.Studio
//go:generate go run github.com/vektah/dataloaden TagLoader int *github.com/stashapp/stash_audio/pkg/models.Tag
//go:generate go run github.com/vektah/dataloaden GroupLoader int *github.com/stashapp/stash_audio/pkg/models.Group
//go:generate go run github.com/vektah/dataloaden FileLoader github.com/stashapp/stash_audio/pkg/models.FileID github.com/stashapp/stash_audio/pkg/models.File
//go:generate go run github.com/vektah/dataloaden FolderLoader github.com/stashapp/stash_audio/pkg/models.FolderID *github.com/stashapp/stash_audio/pkg/models.Folder
//go:generate go run github.com/vektah/dataloaden FolderParentFolderIDsLoader github.com/stashapp/stash_audio/pkg/models.FolderID []github.com/stashapp/stash_audio/pkg/models.FolderID
//go:generate go run github.com/vektah/dataloaden AudioFileIDsLoader int []github.com/stashapp/stash_audio/pkg/models.FileID
//go:generate go run github.com/vektah/dataloaden CustomFieldsLoader int github.com/stashapp/stash_audio/pkg/models.CustomFieldMap
package loaders

import (
	"context"
	"net/http"
	"time"

	"github.com/stashapp/stash_audio/pkg/models"
)

type contextKey struct{ name string }

var (
	loadersCtxKey = &contextKey{"loaders"}
)

const (
	wait     = 1 * time.Millisecond
	maxBatch = 100
)

type Loaders struct {
	AudioFiles *AudioFileIDsLoader

	PerformerByID         *PerformerLoader
	PerformerCustomFields *CustomFieldsLoader

	StudioByID         *StudioLoader
	StudioCustomFields *CustomFieldsLoader

	TagByID         *TagLoader
	TagCustomFields *CustomFieldsLoader

	GroupByID         *GroupLoader
	GroupCustomFields *CustomFieldsLoader

	FileByID *FileLoader

	FolderByID            *FolderLoader
	FolderParentFolderIDs *FolderParentFolderIDsLoader
}

type Middleware struct {
	Repository models.Repository
}

func (m Middleware) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		ldrs := Loaders{
			PerformerByID: &PerformerLoader{
				wait:     wait,
				maxBatch: maxBatch,
				fetch:    m.fetchPerformers(ctx),
			},
			PerformerCustomFields: &CustomFieldsLoader{
				wait:     wait,
				maxBatch: maxBatch,
				fetch:    m.fetchPerformerCustomFields(ctx),
			},
			StudioCustomFields: &CustomFieldsLoader{
				wait:     wait,
				maxBatch: maxBatch,
				fetch:    m.fetchStudioCustomFields(ctx),
			},
			StudioByID: &StudioLoader{
				wait:     wait,
				maxBatch: maxBatch,
				fetch:    m.fetchStudios(ctx),
			},
			TagByID: &TagLoader{
				wait:     wait,
				maxBatch: maxBatch,
				fetch:    m.fetchTags(ctx),
			},
			TagCustomFields: &CustomFieldsLoader{
				wait:     wait,
				maxBatch: maxBatch,
				fetch:    m.fetchTagCustomFields(ctx),
			},
			GroupByID: &GroupLoader{
				wait:     wait,
				maxBatch: maxBatch,
				fetch:    m.fetchGroups(ctx),
			},
			GroupCustomFields: &CustomFieldsLoader{
				wait:     wait,
				maxBatch: maxBatch,
				fetch:    m.fetchGroupCustomFields(ctx),
			},
			FileByID: &FileLoader{
				wait:     wait,
				maxBatch: maxBatch,
				fetch:    m.fetchFiles(ctx),
			},
			FolderByID: &FolderLoader{
				wait:     wait,
				maxBatch: maxBatch,
				fetch:    m.fetchFolders(ctx),
			},
			FolderParentFolderIDs: &FolderParentFolderIDsLoader{
				wait:     wait,
				maxBatch: maxBatch,
				fetch:    m.fetchFoldersParentFolderIDs(ctx),
			},
			AudioFiles: &AudioFileIDsLoader{
				wait:     wait,
				maxBatch: maxBatch,
				fetch:    m.fetchAudiosFileIDs(ctx),
			},
		}

		newCtx := context.WithValue(r.Context(), loadersCtxKey, ldrs)
		next.ServeHTTP(w, r.WithContext(newCtx))
	})
}

func From(ctx context.Context) Loaders {
	return ctx.Value(loadersCtxKey).(Loaders)
}

func toErrorSlice(err error) []error {
	if err != nil {
		return []error{err}
	}

	return nil
}

func (m Middleware) fetchPerformers(ctx context.Context) func(keys []int) ([]*models.Performer, []error) {
	return func(keys []int) (ret []*models.Performer, errs []error) {
		err := m.Repository.WithDB(ctx, func(ctx context.Context) error {
			var err error
			ret, err = m.Repository.Performer.FindMany(ctx, keys)
			return err
		})
		return ret, toErrorSlice(err)
	}
}

func (m Middleware) fetchPerformerCustomFields(ctx context.Context) func(keys []int) ([]models.CustomFieldMap, []error) {
	return func(keys []int) (ret []models.CustomFieldMap, errs []error) {
		err := m.Repository.WithDB(ctx, func(ctx context.Context) error {
			var err error
			ret, err = m.Repository.Performer.GetCustomFieldsBulk(ctx, keys)
			return err
		})
		return ret, toErrorSlice(err)
	}
}

func (m Middleware) fetchStudios(ctx context.Context) func(keys []int) ([]*models.Studio, []error) {
	return func(keys []int) (ret []*models.Studio, errs []error) {
		err := m.Repository.WithDB(ctx, func(ctx context.Context) error {
			var err error
			ret, err = m.Repository.Studio.FindMany(ctx, keys)
			return err
		})
		return ret, toErrorSlice(err)
	}
}

func (m Middleware) fetchStudioCustomFields(ctx context.Context) func(keys []int) ([]models.CustomFieldMap, []error) {
	return func(keys []int) (ret []models.CustomFieldMap, errs []error) {
		err := m.Repository.WithDB(ctx, func(ctx context.Context) error {
			var err error
			ret, err = m.Repository.Studio.GetCustomFieldsBulk(ctx, keys)
			return err
		})
		return ret, toErrorSlice(err)
	}
}

func (m Middleware) fetchTags(ctx context.Context) func(keys []int) ([]*models.Tag, []error) {
	return func(keys []int) (ret []*models.Tag, errs []error) {
		err := m.Repository.WithDB(ctx, func(ctx context.Context) error {
			var err error
			ret, err = m.Repository.Tag.FindMany(ctx, keys)
			return err
		})
		return ret, toErrorSlice(err)
	}
}

func (m Middleware) fetchTagCustomFields(ctx context.Context) func(keys []int) ([]models.CustomFieldMap, []error) {
	return func(keys []int) (ret []models.CustomFieldMap, errs []error) {
		err := m.Repository.WithDB(ctx, func(ctx context.Context) error {
			var err error
			ret, err = m.Repository.Tag.GetCustomFieldsBulk(ctx, keys)
			return err
		})
		return ret, toErrorSlice(err)
	}
}

func (m Middleware) fetchGroupCustomFields(ctx context.Context) func(keys []int) ([]models.CustomFieldMap, []error) {
	return func(keys []int) (ret []models.CustomFieldMap, errs []error) {
		err := m.Repository.WithDB(ctx, func(ctx context.Context) error {
			var err error
			ret, err = m.Repository.Group.GetCustomFieldsBulk(ctx, keys)
			return err
		})
		return ret, toErrorSlice(err)
	}
}

func (m Middleware) fetchGroups(ctx context.Context) func(keys []int) ([]*models.Group, []error) {
	return func(keys []int) (ret []*models.Group, errs []error) {
		err := m.Repository.WithDB(ctx, func(ctx context.Context) error {
			var err error
			ret, err = m.Repository.Group.FindMany(ctx, keys)
			return err
		})
		return ret, toErrorSlice(err)
	}
}

func (m Middleware) fetchFiles(ctx context.Context) func(keys []models.FileID) ([]models.File, []error) {
	return func(keys []models.FileID) (ret []models.File, errs []error) {
		err := m.Repository.WithDB(ctx, func(ctx context.Context) error {
			var err error
			ret, err = m.Repository.File.Find(ctx, keys...)
			return err
		})
		return ret, toErrorSlice(err)
	}
}

func (m Middleware) fetchFolders(ctx context.Context) func(keys []models.FolderID) ([]*models.Folder, []error) {
	return func(keys []models.FolderID) (ret []*models.Folder, errs []error) {
		err := m.Repository.WithDB(ctx, func(ctx context.Context) error {
			var err error
			ret, err = m.Repository.Folder.FindMany(ctx, keys)
			return err
		})
		return ret, toErrorSlice(err)
	}
}

func (m Middleware) fetchFoldersParentFolderIDs(ctx context.Context) func(keys []models.FolderID) ([][]models.FolderID, []error) {
	return func(keys []models.FolderID) (ret [][]models.FolderID, errs []error) {
		err := m.Repository.WithDB(ctx, func(ctx context.Context) error {
			var err error
			ret, err = m.Repository.Folder.GetManyParentFolderIDs(ctx, keys)
			return err
		})
		return ret, toErrorSlice(err)
	}
}

func (m Middleware) fetchAudiosFileIDs(ctx context.Context) func(keys []int) ([][]models.FileID, []error) {
	return func(keys []int) (ret [][]models.FileID, errs []error) {
		err := m.Repository.WithDB(ctx, func(ctx context.Context) error {
			var err error
			ret, err = m.Repository.Audio.GetManyFileIDs(ctx, keys)
			return err
		})
		return ret, toErrorSlice(err)
	}
}
