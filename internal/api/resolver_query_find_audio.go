package api

import (
	"context"
	"slices"
	"strconv"

	"github.com/99designs/gqlgen/graphql"
	"github.com/stashapp/stash_audio/pkg/models"
)

func (r *queryResolver) FindAudio(ctx context.Context, id *string, checksum *string) (*models.Audio, error) {
	var audio *models.Audio

	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		qb := r.repository.Audio
		var err error

		if id != nil {
			idInt, err := strconv.Atoi(*id)
			if err != nil {
				return err
			}

			audio, err = qb.Find(ctx, idInt)
			return err
		} else if checksum != nil {
			var audios []*models.Audio
			audios, err = qb.FindByChecksum(ctx, *checksum)
			if err != nil {
				return err
			}
			if len(audios) > 0 {
				audio = audios[0]
			}
		}

		return err
	}); err != nil {
		return nil, err
	}

	return audio, nil
}

func (r *queryResolver) FindAudios(
	ctx context.Context,
	audioFilter *models.AudioFilterType,
	ids []string,
	filter *models.FindFilterType,
) (ret *FindAudiosResultType, err error) {
	var audioIDs []int
	if len(ids) > 0 {
		audioIDs, err = handleIDList(ids, "ids")
		if err != nil {
			return nil, err
		}
	}

	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		qb := r.repository.Audio
		fields := graphql.CollectAllFields(ctx)
		result := &models.AudioQueryResult{}

		var audios []*models.Audio

		if len(audioIDs) > 0 {
			audios, err = qb.FindMany(ctx, audioIDs)
			if err == nil {
				result.Count = len(audios)
				for _, a := range audios {
					if err = a.LoadPrimaryFile(ctx, r.repository.File); err != nil {
						break
					}
					f := a.Files.Primary()
					if f == nil {
						continue
					}
					af, ok := f.(*models.AudioFile)
					if !ok {
						continue
					}
					result.TotalDuration += af.Duration
					result.TotalSize += float64(f.Base().Size)
				}
			}
		} else {
			result, err = qb.Query(ctx, models.AudioQueryOptions{
				QueryOptions: models.QueryOptions{
					FindFilter: filter,
					Count:      slices.Contains(fields, "count"),
				},
				AudioFilter:   audioFilter,
				TotalDuration: slices.Contains(fields, "duration"),
				TotalSize:     slices.Contains(fields, "filesize"),
			})
			if err == nil {
				audios, err = result.Resolve(ctx)
			}
		}

		if err != nil {
			return err
		}

		ret = &FindAudiosResultType{
			Count:    result.Count,
			Audios:   audios,
			Duration: result.TotalDuration,
			Filesize: result.TotalSize,
		}

		return nil
	}); err != nil {
		return nil, err
	}

	return ret, nil
}

func (r *queryResolver) FindAudiosByPathRegex(ctx context.Context, filter *models.FindFilterType) (ret *FindAudiosResultType, err error) {
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		qb := r.repository.Audio
		fields := graphql.CollectAllFields(ctx)

		result, err := qb.Query(ctx, models.AudioQueryOptions{
			QueryOptions: models.QueryOptions{
				FindFilter: filter,
				Count:      slices.Contains(fields, "count"),
			},
			TotalDuration: slices.Contains(fields, "duration"),
			TotalSize:     slices.Contains(fields, "filesize"),
		})
		if err != nil {
			return err
		}

		audios, err := result.Resolve(ctx)
		if err != nil {
			return err
		}

		ret = &FindAudiosResultType{
			Count:    result.Count,
			Audios:   audios,
			Duration: result.TotalDuration,
			Filesize: result.TotalSize,
		}
		return nil
	}); err != nil {
		return nil, err
	}

	return ret, nil
}
