//go:build integration
// +build integration

package sqlite_test

import (
	"context"
	"testing"
	"time"

	"github.com/stashapp/stash/pkg/models"
	"github.com/stretchr/testify/assert"
)

func loadAudioRelationships(ctx context.Context, expected models.Audio, actual *models.Audio) error {
	if expected.URLs.Loaded() {
		if err := actual.LoadURLs(ctx, db.Audio); err != nil {
			return err
		}
	}
	if expected.TagIDs.Loaded() {
		if err := actual.LoadTagIDs(ctx, db.Audio); err != nil {
			return err
		}
	}
	if expected.PerformerIDs.Loaded() {
		if err := actual.LoadPerformerIDs(ctx, db.Audio); err != nil {
			return err
		}
	}
	if expected.Files.Loaded() {
		if err := actual.LoadFiles(ctx, db.Audio); err != nil {
			return err
		}
	}

	// clear transient fields populated from file joins
	if expected.Path == "" {
		actual.Path = ""
	}
	if expected.Checksum == "" {
		actual.Checksum = ""
	}
	if expected.PrimaryFileID == nil {
		actual.PrimaryFileID = nil
	}

	return nil
}

func Test_audioQueryBuilder_Create(t *testing.T) {
	var (
		title        = "title"
		details      = "details"
		rating       = 60
		ocounter     = 3
		playCount    = 7
		url          = "https://example.com/audio"
		date, _      = models.ParseDate("2023-06-15")
		lastPlayedAt = time.Date(2023, 6, 1, 0, 0, 0, 0, time.UTC)
		resumeTime   = 45.5
		playDuration = 180.0
		createdAt    = time.Date(2001, 1, 1, 0, 0, 0, 0, time.UTC)
		updatedAt    = time.Date(2001, 1, 1, 0, 0, 0, 0, time.UTC)
	)

	tests := []struct {
		name      string
		newObject models.Audio
		wantErr   bool
	}{
		{
			"full",
			models.Audio{
				Title:        title,
				Details:      details,
				Rating:       &rating,
				Date:         &date,
				Organized:    true,
				OCounter:     ocounter,
				PlayCount:    playCount,
				LastPlayedAt: &lastPlayedAt,
				ResumeTime:   resumeTime,
				PlayDuration: playDuration,
				StudioID:     &studioIDs[studioIdxWithScene],
				URLs:         models.NewRelatedStrings([]string{url}),
				TagIDs:       models.NewRelatedIDs([]int{tagIDs[tagIdxWithScene]}),
				PerformerIDs: models.NewRelatedIDs([]int{performerIDs[performerIdxWithScene]}),
				CreatedAt:    createdAt,
				UpdatedAt:    updatedAt,
			},
			false,
		},
		{
			"minimal",
			models.Audio{
				Title:     title,
				CreatedAt: createdAt,
				UpdatedAt: updatedAt,
			},
			false,
		},
	}

	qb := db.Audio

	for _, tt := range tests {
		runWithRollbackTxn(t, tt.name, func(t *testing.T, ctx context.Context) {
			got := tt.newObject

			if err := qb.Create(ctx, &got, nil); (err != nil) != tt.wantErr {
				t.Errorf("audioQueryBuilder.Create() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if tt.wantErr {
				return
			}

			assert.Greater(t, got.ID, 0)

			copy := tt.newObject
			copy.ID = got.ID

			if err := loadAudioRelationships(ctx, copy, &got); err != nil {
				t.Errorf("loadAudioRelationships() error = %v", err)
				return
			}

			assert.Equal(t, copy, got)
		})
	}
}

func Test_audioQueryBuilder_Update(t *testing.T) {
	const audioIdx = 0

	qb := db.Audio

	runWithRollbackTxn(t, "update full", func(t *testing.T, ctx context.Context) {
		updatedAudio := makeAudio(audioIdx)
		updatedAudio.ID = audioIDs[audioIdx]
		updatedAudio.Title = "updated title"
		updatedAudio.PlayCount = 15
		lastPlayed := time.Date(2024, 3, 1, 0, 0, 0, 0, time.UTC)
		updatedAudio.LastPlayedAt = &lastPlayed

		if err := qb.Update(ctx, updatedAudio); err != nil {
			t.Errorf("audioQueryBuilder.Update() error = %v", err)
			return
		}

		got, err := qb.Find(ctx, updatedAudio.ID)
		if err != nil {
			t.Errorf("audioQueryBuilder.Find() error = %v", err)
			return
		}

		assert.Equal(t, updatedAudio.Title, got.Title)
		assert.Equal(t, 15, got.PlayCount)
		assert.Equal(t, &lastPlayed, got.LastPlayedAt)
	})
}

func Test_audioQueryBuilder_UpdatePartial(t *testing.T) {
	const audioIdx = 0

	qb := db.Audio

	tests := []struct {
		name    string
		id      int
		partial models.AudioPartial
		verify  func(t *testing.T, got *models.Audio)
	}{
		{
			"title only",
			audioIDs[audioIdx],
			models.AudioPartial{
				Title: models.NewOptionalString("partial updated title"),
			},
			func(t *testing.T, got *models.Audio) {
				assert.Equal(t, "partial updated title", got.Title)
			},
		},
		{
			"PlayCount and LastPlayedAt",
			audioIDs[audioIdx],
			models.AudioPartial{
				PlayCount:    models.NewOptionalInt(42),
				LastPlayedAt: models.NewOptionalTime(time.Date(2024, 6, 1, 0, 0, 0, 0, time.UTC)),
			},
			func(t *testing.T, got *models.Audio) {
				assert.Equal(t, 42, got.PlayCount)
				assert.NotNil(t, got.LastPlayedAt)
				assert.Equal(t, 2024, got.LastPlayedAt.Year())
			},
		},
		{
			"clear LastPlayedAt",
			audioIDs[audioIdx],
			models.AudioPartial{
				LastPlayedAt: models.OptionalTime{Set: true, Null: true},
			},
			func(t *testing.T, got *models.Audio) {
				assert.Nil(t, got.LastPlayedAt)
			},
		},
	}

	for _, tt := range tests {
		runWithRollbackTxn(t, tt.name, func(t *testing.T, ctx context.Context) {
			got, err := qb.UpdatePartial(ctx, tt.id, tt.partial)
			if err != nil {
				t.Errorf("audioQueryBuilder.UpdatePartial() error = %v", err)
				return
			}
			tt.verify(t, got)
		})
	}
}

func Test_audioQueryBuilder_Find(t *testing.T) {
	const audioIdx = 0

	qb := db.Audio

	withRollbackTxn(func(ctx context.Context) error {
		got, err := qb.Find(ctx, audioIDs[audioIdx])
		if err != nil {
			return err
		}

		assert.Equal(t, audioIDs[audioIdx], got.ID)
		assert.Equal(t, makeAudio(audioIdx).Title, got.Title)
		return nil
	})
}

func Test_audioQueryBuilder_FindByFingerprints(t *testing.T) {
	const audioIdx = 0

	qb := db.Audio

	withRollbackTxn(func(ctx context.Context) error {
		fp := []models.Fingerprint{
			{
				Type:        models.FingerprintTypeMD5,
				Fingerprint: getAudioStringValue(audioIdx, checksumField),
			},
		}

		got, err := qb.FindByFingerprints(ctx, fp)
		if err != nil {
			return err
		}

		assert.Len(t, got, 1)
		if len(got) > 0 {
			assert.Equal(t, audioIDs[audioIdx], got[0].ID)
		}
		return nil
	})
}

func Test_audioQueryBuilder_FindByFileID(t *testing.T) {
	const audioIdx = 0

	qb := db.Audio

	withRollbackTxn(func(ctx context.Context) error {
		got, err := qb.FindByFileID(ctx, audioFileIDs[audioIdx])
		if err != nil {
			return err
		}

		assert.Len(t, got, 1)
		if len(got) > 0 {
			assert.Equal(t, audioIDs[audioIdx], got[0].ID)
		}
		return nil
	})
}

func Test_audioQueryBuilder_FindByPerformerID(t *testing.T) {
	qb := db.Audio

	withRollbackTxn(func(ctx context.Context) error {
		got, err := qb.FindByPerformerID(ctx, performerIDs[performerIdxWithScene])
		if err != nil {
			return err
		}

		assert.Len(t, got, 1)
		if len(got) > 0 {
			assert.Equal(t, audioIDs[audioIdxWithPerformer], got[0].ID)
		}
		return nil
	})
}

func Test_audioQueryBuilder_PlayCountAndLastPlayedAt(t *testing.T) {
	qb := db.Audio

	withRollbackTxn(func(ctx context.Context) error {
		got, err := qb.Find(ctx, audioIDs[audioIdxWithPlayCount])
		if err != nil {
			return err
		}

		assert.Equal(t, getAudioPlayCount(audioIdxWithPlayCount), got.PlayCount)
		assert.NotNil(t, got.LastPlayedAt)
		return nil
	})
}

func Test_audioQueryBuilder_Cover(t *testing.T) {
	const audioIdx = 0

	qb := db.Audio
	coverData := []byte("fake cover image data")

	runWithRollbackTxn(t, "cover CRUD", func(t *testing.T, ctx context.Context) {
		id := audioIDs[audioIdx]

		// no cover initially
		hasCover, err := qb.HasCover(ctx, id)
		assert.NoError(t, err)
		assert.False(t, hasCover)

		// set cover
		err = qb.UpdateCover(ctx, id, coverData)
		assert.NoError(t, err)

		hasCover, err = qb.HasCover(ctx, id)
		assert.NoError(t, err)
		assert.True(t, hasCover)

		got, err := qb.GetCover(ctx, id)
		assert.NoError(t, err)
		assert.Equal(t, coverData, got)
	})
}

func Test_audioQueryBuilder_Count(t *testing.T) {
	qb := db.Audio

	withRollbackTxn(func(ctx context.Context) error {
		count, err := qb.Count(ctx)
		if err != nil {
			return err
		}
		assert.Equal(t, totalAudios, count)
		return nil
	})
}

func Test_audioQueryBuilder_Destroy(t *testing.T) {
	const audioIdx = 0

	qb := db.Audio

	runWithRollbackTxn(t, "destroy", func(t *testing.T, ctx context.Context) {
		id := audioIDs[audioIdx]

		err := qb.Destroy(ctx, id)
		assert.NoError(t, err)

		got, err := qb.Find(ctx, id)
		assert.NoError(t, err)
		assert.Nil(t, got)
	})
}

func Test_audioQueryBuilder_TagIDs(t *testing.T) {
	qb := db.Audio

	withRollbackTxn(func(ctx context.Context) error {
		audio, err := qb.Find(ctx, audioIDs[audioIdxWithTag])
		if err != nil {
			return err
		}

		if err := audio.LoadTagIDs(ctx, qb); err != nil {
			return err
		}

		assert.True(t, audio.TagIDs.Loaded())
		assert.Contains(t, audio.TagIDs.List(), tagIDs[tagIdxWithScene])
		return nil
	})
}

func Test_audioQueryBuilder_PerformerIDs(t *testing.T) {
	qb := db.Audio

	withRollbackTxn(func(ctx context.Context) error {
		audio, err := qb.Find(ctx, audioIDs[audioIdxWithPerformer])
		if err != nil {
			return err
		}

		if err := audio.LoadPerformerIDs(ctx, qb); err != nil {
			return err
		}

		assert.True(t, audio.PerformerIDs.Loaded())
		assert.Contains(t, audio.PerformerIDs.List(), performerIDs[performerIdxWithScene])
		return nil
	})
}
