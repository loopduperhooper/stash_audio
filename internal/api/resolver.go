package api

import (
	"context"
	"errors"

	"github.com/stashapp/stash_audio/internal/build"
	"github.com/stashapp/stash_audio/internal/manager"
	"github.com/stashapp/stash_audio/pkg/logger"
	"github.com/stashapp/stash_audio/pkg/models"
	"github.com/stashapp/stash_audio/pkg/plugin/hook"
)

var (
	// ErrNotImplemented is an error which means the given functionality isn't implemented by the API.
	ErrNotImplemented = errors.New("not implemented")

	// ErrNotSupported is returned whenever there's a test, which can be used to guard against the error,
	// but the given parameters aren't supported by the system.
	ErrNotSupported = errors.New("not supported")

	// ErrInput signifies errors where the input isn't valid for some reason. And no more specific error exists.
	ErrInput = errors.New("input error")
)

type hookExecutor interface {
	ExecutePostHooks(ctx context.Context, id int, hookType hook.TriggerEnum, input interface{}, inputFields []string)
}

type Resolver struct {
	repository   models.Repository
	groupService manager.GroupService

	hookExecutor hookExecutor
}

func (r *Resolver) Mutation() MutationResolver {
	return &mutationResolver{r}
}
func (r *Resolver) Performer() PerformerResolver {
	return &performerResolver{r}
}
func (r *Resolver) Query() QueryResolver {
	return &queryResolver{r}
}
func (r *Resolver) Studio() StudioResolver {
	return &studioResolver{r}
}

func (r *Resolver) Group() GroupResolver {
	return &groupResolver{r}
}
func (r *Resolver) Movie() MovieResolver {
	return &movieResolver{&groupResolver{r}}
}

func (r *Resolver) Subscription() SubscriptionResolver {
	return &subscriptionResolver{r}
}
func (r *Resolver) Tag() TagResolver {
	return &tagResolver{r}
}
func (r *Resolver) AudioFile() AudioFileResolver {
	return &audioFileResolver{r}
}
func (r *Resolver) BasicFile() BasicFileResolver {
	return &basicFileResolver{r}
}
func (r *Resolver) Audio() AudioResolver {
	return &audioResolver{r}
}
func (r *Resolver) Folder() FolderResolver {
	return &folderResolver{r}
}
func (r *Resolver) SavedFilter() SavedFilterResolver {
	return &savedFilterResolver{r}
}
func (r *Resolver) Plugin() PluginResolver {
	return &pluginResolver{r}
}
func (r *Resolver) ConfigResult() ConfigResultResolver {
	return &configResultResolver{r}
}

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }

type performerResolver struct{ *Resolver }
type studioResolver struct{ *Resolver }

// movie is group under the hood
type groupResolver struct{ *Resolver }
type movieResolver struct{ *groupResolver }

type tagResolver struct{ *Resolver }
type audioFileResolver struct{ *Resolver }
type basicFileResolver struct{ *Resolver }
type folderResolver struct{ *Resolver }
type savedFilterResolver struct{ *Resolver }
type pluginResolver struct{ *Resolver }
type configResultResolver struct{ *Resolver }

type audioResolver struct{ *Resolver }

func (r *Resolver) withTxn(ctx context.Context, fn func(ctx context.Context) error) error {
	return r.repository.WithTxn(ctx, fn)
}

func (r *Resolver) withReadTxn(ctx context.Context, fn func(ctx context.Context) error) error {
	return r.repository.WithReadTxn(ctx, fn)
}

func (r *queryResolver) Stats(ctx context.Context) (*StatsResultType, error) {
	var ret StatsResultType
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		repo := r.repository
		audioQB := repo.Audio
		studioQB := repo.Studio
		performerQB := repo.Performer
		groupQB := repo.Group
		tagQB := repo.Tag

		audiosCount, err := audioQB.Count(ctx)
		if err != nil {
			return err
		}

		audiosSize, err := audioQB.Size(ctx)
		if err != nil {
			return err
		}

		audiosDuration, err := audioQB.Duration(ctx)
		if err != nil {
			return err
		}

		performersCount, err := performerQB.Count(ctx)
		if err != nil {
			return err
		}

		studiosCount, err := studioQB.Count(ctx)
		if err != nil {
			return err
		}

		groupsCount, err := groupQB.Count(ctx)
		if err != nil {
			return err
		}

		tagsCount, err := tagQB.Count(ctx)
		if err != nil {
			return err
		}

		ret = StatsResultType{
			AudioCount:     audiosCount,
			AudiosSize:     audiosSize,
			AudiosDuration: audiosDuration,
			PerformerCount: performersCount,
			StudioCount:    studiosCount,
			GroupCount:     groupsCount,
			MovieCount:     groupsCount,
			TagCount:       tagsCount,
		}

		return nil
	}); err != nil {
		return nil, err
	}

	return &ret, nil
}

func (r *queryResolver) Version(ctx context.Context) (*Version, error) {
	version, hash, buildtime := build.Version()

	return &Version{
		Version:   &version,
		Hash:      hash,
		BuildTime: buildtime,
	}, nil
}

func (r *queryResolver) Latestversion(ctx context.Context) (*LatestVersion, error) {
	latestRelease, err := GetLatestRelease(ctx)
	if err != nil {
		if !errors.Is(err, context.Canceled) {
			logger.Errorf("Error while retrieving latest version: %v", err)
		}
		return nil, err
	}
	logger.Infof("Retrieved latest version: %s (%s)", latestRelease.Version, latestRelease.ShortHash)

	return &LatestVersion{
		Version:     latestRelease.Version,
		Shorthash:   latestRelease.ShortHash,
		ReleaseDate: latestRelease.Date,
		URL:         latestRelease.Url,
	}, nil
}

func (r *mutationResolver) ExecSQL(ctx context.Context, sql string, args []interface{}) (*SQLExecResult, error) {
	var rowsAffected *int64
	var lastInsertID *int64

	db := manager.GetInstance().Database
	if err := r.withTxn(ctx, func(ctx context.Context) error {
		var err error
		rowsAffected, lastInsertID, err = db.ExecSQL(ctx, sql, args)
		return err
	}); err != nil {
		return nil, err
	}

	return &SQLExecResult{
		RowsAffected: rowsAffected,
		LastInsertID: lastInsertID,
	}, nil
}

func (r *mutationResolver) QuerySQL(ctx context.Context, sql string, args []interface{}) (*SQLQueryResult, error) {
	var cols []string
	var rows [][]interface{}

	db := manager.GetInstance().Database
	if err := r.withTxn(ctx, func(ctx context.Context) error {
		var err error
		cols, rows, err = db.QuerySQL(ctx, sql, args)
		return err
	}); err != nil {
		return nil, err
	}

	return &SQLQueryResult{
		Columns: cols,
		Rows:    rows,
	}, nil
}

func firstError(errs []error) error {
	for _, e := range errs {
		if e != nil {
			return e
		}
	}

	return nil
}
