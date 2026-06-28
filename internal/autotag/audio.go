package autotag

import (
	"context"
	"slices"

	"github.com/stashapp/stash_audio/pkg/match"
	"github.com/stashapp/stash_audio/pkg/models"
)

// AudioFinderUpdater provides methods to find and update audios for autotagging.
type AudioFinderUpdater interface {
	models.AudioQueryer
	models.AudioUpdater
	models.PerformerIDLoader
	models.TagIDLoader
}

func getAudioFileTagger(a *models.Audio, cache *match.Cache) tagger {
	return tagger{
		ID:    a.ID,
		Type:  "audio",
		Name:  a.DisplayName(),
		Path:  a.Path,
		cache: cache,
	}
}

// AudioPerformers tags the provided audio with performers whose name matches the audio's path.
func AudioPerformers(ctx context.Context, a *models.Audio, rw AudioFinderUpdater, performerReader models.PerformerAutoTagQueryer, cache *match.Cache) error {
	t := getAudioFileTagger(a, cache)

	return t.tagPerformers(ctx, performerReader, func(subjectID, otherID int) (bool, error) {
		if err := a.LoadPerformerIDs(ctx, rw); err != nil {
			return false, err
		}
		existing := a.PerformerIDs.List()

		if slices.Contains(existing, otherID) {
			return false, nil
		}

		_, err := rw.UpdatePartial(ctx, subjectID, models.AudioPartial{
			PerformerIDs: &models.UpdateIDs{
				IDs:  []int{otherID},
				Mode: models.RelationshipUpdateModeAdd,
			},
		})
		if err != nil {
			return false, err
		}
		return true, nil
	})
}

// AudioStudios tags the provided audio with the first studio whose name matches the audio's path.
// Audios will not be tagged if studio is already set.
func AudioStudios(ctx context.Context, a *models.Audio, rw AudioFinderUpdater, studioReader models.StudioAutoTagQueryer, t *Tagger) error {
	if a.StudioID != nil {
		return nil
	}

	tgr := getAudioFileTagger(a, t.Cache)

	return tgr.tagStudios(ctx, studioReader, func(subjectID, otherID int) (bool, error) {
		_, err := rw.UpdatePartial(ctx, subjectID, models.AudioPartial{
			StudioID: models.NewOptionalInt(otherID),
		})
		if err != nil {
			return false, err
		}
		return true, nil
	})
}

// AudioTags tags the provided audio with tags whose name matches the audio's path.
func AudioTags(ctx context.Context, a *models.Audio, rw AudioFinderUpdater, tagReader models.TagAutoTagQueryer, cache *match.Cache) error {
	t := getAudioFileTagger(a, cache)

	return t.tagTags(ctx, tagReader, func(subjectID, otherID int) (bool, error) {
		if err := a.LoadTagIDs(ctx, rw); err != nil {
			return false, err
		}
		existing := a.TagIDs.List()

		if slices.Contains(existing, otherID) {
			return false, nil
		}

		_, err := rw.UpdatePartial(ctx, subjectID, models.AudioPartial{
			TagIDs: &models.UpdateIDs{
				IDs:  []int{otherID},
				Mode: models.RelationshipUpdateModeAdd,
			},
		})
		if err != nil {
			return false, err
		}
		return true, nil
	})
}

// PerformerAudios tags audios in the given paths with the provided performer.
func (t *Tagger) PerformerAudios(ctx context.Context, p *models.Performer, paths []string, rw AudioFinderUpdater) error {
	taggers := getPerformerTaggers(p, t.Cache)

	for _, tgr := range taggers {
		if err := tgr.tagAudios(ctx, paths, rw, func(o *models.Audio) (bool, error) {
			if err := o.LoadPerformerIDs(ctx, rw); err != nil {
				return false, err
			}
			existing := o.PerformerIDs.List()
			if slices.Contains(existing, p.ID) {
				return false, nil
			}
			_, err := rw.UpdatePartial(ctx, o.ID, models.AudioPartial{
				PerformerIDs: &models.UpdateIDs{
					IDs:  []int{p.ID},
					Mode: models.RelationshipUpdateModeAdd,
				},
			})
			if err != nil {
				return false, err
			}
			return true, nil
		}); err != nil {
			return err
		}
	}
	return nil
}

// StudioAudios tags audios in the given paths with the provided studio.
func (t *Tagger) StudioAudios(ctx context.Context, s *models.Studio, paths []string, aliases []string, rw AudioFinderUpdater) error {
	taggers := getStudioTagger(s, aliases, t.Cache)

	for _, tgr := range taggers {
		if err := tgr.tagAudios(ctx, paths, rw, func(o *models.Audio) (bool, error) {
			if o.StudioID != nil {
				return false, nil
			}
			_, err := rw.UpdatePartial(ctx, o.ID, models.AudioPartial{
				StudioID: models.NewOptionalInt(s.ID),
			})
			if err != nil {
				return false, err
			}
			return true, nil
		}); err != nil {
			return err
		}
	}
	return nil
}

// TagAudios tags audios in the given paths with the provided tag.
func (t *Tagger) TagAudios(ctx context.Context, tag *models.Tag, paths []string, aliases []string, rw AudioFinderUpdater) error {
	taggers := getTagTaggers(tag, aliases, t.Cache)

	for _, tgr := range taggers {
		if err := tgr.tagAudios(ctx, paths, rw, func(o *models.Audio) (bool, error) {
			if err := o.LoadTagIDs(ctx, rw); err != nil {
				return false, err
			}
			existing := o.TagIDs.List()
			if slices.Contains(existing, tag.ID) {
				return false, nil
			}
			_, err := rw.UpdatePartial(ctx, o.ID, models.AudioPartial{
				TagIDs: &models.UpdateIDs{
					IDs:  []int{tag.ID},
					Mode: models.RelationshipUpdateModeAdd,
				},
			})
			if err != nil {
				return false, err
			}
			return true, nil
		}); err != nil {
			return err
		}
	}
	return nil
}
