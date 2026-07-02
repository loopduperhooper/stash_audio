package api

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/stashapp/stash/pkg/models"
	"github.com/stashapp/stash/pkg/plugin/hook"
	"github.com/stashapp/stash/pkg/sliceutil/stringslice"
	"github.com/stashapp/stash/pkg/utils"
)

func (r *mutationResolver) getAudio(ctx context.Context, id int) (ret *models.Audio, err error) {
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		ret, err = r.repository.Audio.Find(ctx, id)
		return err
	}); err != nil {
		return nil, err
	}
	return ret, nil
}

func (r *mutationResolver) AudioCreate(ctx context.Context, input AudioCreateInput) (ret *models.Audio, err error) {
	translator := changesetTranslator{
		inputMap: getUpdateInputMap(ctx),
	}

	fileIDs, err := translator.fileIDSliceFromStringSlice(input.FileIds)
	if err != nil {
		return nil, fmt.Errorf("converting file ids: %w", err)
	}

	newAudio := models.NewAudio()

	newAudio.Title = translator.string(input.Title)
	newAudio.Details = translator.string(input.Details)
	newAudio.Rating = input.Rating100
	newAudio.Organized = translator.bool(input.Organized)

	newAudio.Date, err = translator.datePtr(input.Date)
	if err != nil {
		return nil, fmt.Errorf("converting date: %w", err)
	}
	newAudio.StudioID, err = translator.intPtrFromString(input.StudioID)
	if err != nil {
		return nil, fmt.Errorf("converting studio id: %w", err)
	}

	if input.Urls != nil {
		newAudio.URLs = models.NewRelatedStrings(stringslice.TrimSpace(input.Urls))
	}

	if input.StashIds != nil {
		stashIDs := make(models.StashIDInputs, len(input.StashIds))
		for i, s := range input.StashIds {
			if s != nil {
				stashIDs[i] = *s
			}
		}
		newAudio.StashIDs = models.NewRelatedStashIDs(stashIDs.ToStashIDs())
	}

	newAudio.PerformerIDs, err = translator.relatedIds(input.PerformerIds)
	if err != nil {
		return nil, fmt.Errorf("converting performer ids: %w", err)
	}
	newAudio.TagIDs, err = translator.relatedIds(input.TagIds)
	if err != nil {
		return nil, fmt.Errorf("converting tag ids: %w", err)
	}
	newAudio.GroupIDs, err = translator.relatedIds(input.GroupIds)
	if err != nil {
		return nil, fmt.Errorf("converting group ids: %w", err)
	}

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		ret = &newAudio
		return r.repository.Audio.Create(ctx, ret, fileIDs)
	}); err != nil {
		return nil, err
	}

	if input.CoverImage != nil {
		if err := r.withTxn(ctx, func(ctx context.Context) error {
			imageData, err := utils.ProcessImageInput(ctx, *input.CoverImage)
			if err != nil {
				return err
			}
			return r.repository.Audio.UpdateCover(ctx, ret.ID, imageData)
		}); err != nil {
			return nil, err
		}
	}

	r.hookExecutor.ExecutePostHooks(ctx, ret.ID, hook.AudioCreatePost, input, translator.getFields())
	return r.getAudio(ctx, ret.ID)
}

func (r *mutationResolver) AudioUpdate(ctx context.Context, input AudioUpdateInput) (ret *models.Audio, err error) {
	translator := changesetTranslator{
		inputMap: getUpdateInputMap(ctx),
	}

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		ret, err = r.audioUpdate(ctx, input, translator)
		return err
	}); err != nil {
		return nil, err
	}

	r.hookExecutor.ExecutePostHooks(ctx, ret.ID, hook.AudioUpdatePost, input, translator.getFields())
	return r.getAudio(ctx, ret.ID)
}

func (r *mutationResolver) AudiosUpdate(ctx context.Context, input []*AudioUpdateInput) (ret []*models.Audio, err error) {
	inputMaps := getUpdateInputMaps(ctx)

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		for i, audio := range input {
			translator := changesetTranslator{
				inputMap: inputMaps[i],
			}
			thisAudio, err := r.audioUpdate(ctx, *audio, translator)
			if err != nil {
				return err
			}
			ret = append(ret, thisAudio)
		}
		return nil
	}); err != nil {
		return nil, err
	}

	var newRet []*models.Audio
	for i, audio := range ret {
		translator := changesetTranslator{
			inputMap: inputMaps[i],
		}
		r.hookExecutor.ExecutePostHooks(ctx, audio.ID, hook.AudioUpdatePost, input, translator.getFields())
		audio, err = r.getAudio(ctx, audio.ID)
		if err != nil {
			return nil, err
		}
		newRet = append(newRet, audio)
	}

	return newRet, nil
}

func (r *mutationResolver) audioUpdate(ctx context.Context, input AudioUpdateInput, translator changesetTranslator) (*models.Audio, error) {
	audioID, err := strconv.Atoi(input.ID)
	if err != nil {
		return nil, fmt.Errorf("converting id: %w", err)
	}

	a, err := r.repository.Audio.Find(ctx, audioID)
	if err != nil {
		return nil, err
	}
	if a == nil {
		return nil, fmt.Errorf("audio with id %d not found", audioID)
	}

	updatedAudio := models.NewAudioPartial()
	updatedAudio.Title = translator.optionalString(input.Title, "title")
	updatedAudio.Details = translator.optionalString(input.Details, "details")
	updatedAudio.Rating = translator.optionalInt(input.Rating100, "rating100")
	updatedAudio.Organized = translator.optionalBool(input.Organized, "organized")

	updatedAudio.Date, err = translator.optionalDate(input.Date, "date")
	if err != nil {
		return nil, fmt.Errorf("converting date: %w", err)
	}
	updatedAudio.StudioID, err = translator.optionalIntFromString(input.StudioID, "studio_id")
	if err != nil {
		return nil, fmt.Errorf("converting studio id: %w", err)
	}

	updatedAudio.URLs = translator.optionalURLs(input.Urls, nil)
	if input.StashIds != nil {
		stashIDs := make(models.StashIDInputs, len(input.StashIds))
		for i, s := range input.StashIds {
			if s != nil {
				stashIDs[i] = *s
			}
		}
		updatedAudio.StashIDs = translator.updateStashIDs(stashIDs, "stash_ids")
	}

	updatedAudio.PrimaryFileID, err = translator.fileIDPtrFromString(input.PrimaryFileID)
	if err != nil {
		return nil, fmt.Errorf("converting primary file id: %w", err)
	}

	updatedAudio.PerformerIDs, err = translator.updateIds(input.PerformerIds, "performer_ids")
	if err != nil {
		return nil, fmt.Errorf("converting performer ids: %w", err)
	}
	updatedAudio.TagIDs, err = translator.updateIds(input.TagIds, "tag_ids")
	if err != nil {
		return nil, fmt.Errorf("converting tag ids: %w", err)
	}
	updatedAudio.GroupIDs, err = translator.updateIds(input.GroupIds, "group_ids")
	if err != nil {
		return nil, fmt.Errorf("converting group ids: %w", err)
	}

	audio, err := r.repository.Audio.UpdatePartial(ctx, audioID, updatedAudio)
	if err != nil {
		return nil, err
	}

	if translator.hasField("cover_image") {
		if input.CoverImage != nil {
			imageData, err := utils.ProcessImageInput(ctx, *input.CoverImage)
			if err != nil {
				return nil, err
			}
			if err := r.repository.Audio.UpdateCover(ctx, audioID, imageData); err != nil {
				return nil, err
			}
		}
	}

	return audio, nil
}

func (r *mutationResolver) BulkAudioUpdate(ctx context.Context, input BulkAudioUpdateInput) (ret []*models.Audio, err error) {
	audioIDs, err := stringslice.StringSliceToIntSlice(input.Ids)
	if err != nil {
		return nil, fmt.Errorf("converting ids: %w", err)
	}

	translator := changesetTranslator{
		inputMap: getUpdateInputMap(ctx),
	}

	updatedAudio := models.NewAudioPartial()
	updatedAudio.Title = translator.optionalString(input.Title, "title")
	updatedAudio.Details = translator.optionalString(input.Details, "details")
	updatedAudio.Rating = translator.optionalInt(input.Rating100, "rating100")
	updatedAudio.Organized = translator.optionalBool(input.Organized, "organized")

	updatedAudio.Date, err = translator.optionalDate(input.Date, "date")
	if err != nil {
		return nil, fmt.Errorf("converting date: %w", err)
	}
	updatedAudio.StudioID, err = translator.optionalIntFromString(input.StudioID, "studio_id")
	if err != nil {
		return nil, fmt.Errorf("converting studio id: %w", err)
	}

	updatedAudio.URLs = translator.optionalURLsBulk(input.Urls, nil)
	updatedAudio.PerformerIDs, err = translator.updateIdsBulk(input.PerformerIds, "performer_ids")
	if err != nil {
		return nil, fmt.Errorf("converting performer ids: %w", err)
	}
	updatedAudio.TagIDs, err = translator.updateIdsBulk(input.TagIds, "tag_ids")
	if err != nil {
		return nil, fmt.Errorf("converting tag ids: %w", err)
	}

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		qb := r.repository.Audio
		for _, audioID := range audioIDs {
			audio, err := qb.UpdatePartial(ctx, audioID, updatedAudio)
			if err != nil {
				return err
			}
			ret = append(ret, audio)
		}
		return nil
	}); err != nil {
		return nil, err
	}

	var newRet []*models.Audio
	for _, audio := range ret {
		r.hookExecutor.ExecutePostHooks(ctx, audio.ID, hook.AudioUpdatePost, input, translator.getFields())
		audio, err = r.getAudio(ctx, audio.ID)
		if err != nil {
			return nil, err
		}
		newRet = append(newRet, audio)
	}

	return newRet, nil
}

func (r *mutationResolver) AudioDestroy(ctx context.Context, input AudioDestroyInput) (bool, error) {
	audioID, err := strconv.Atoi(input.ID)
	if err != nil {
		return false, fmt.Errorf("converting id: %w", err)
	}

	var a *models.Audio
	if err := r.withTxn(ctx, func(ctx context.Context) error {
		var err error
		a, err = r.repository.Audio.Find(ctx, audioID)
		if err != nil {
			return err
		}
		if a == nil {
			return fmt.Errorf("audio with id %d not found", audioID)
		}
		return r.repository.Audio.Destroy(ctx, audioID)
	}); err != nil {
		return false, err
	}

	r.hookExecutor.ExecutePostHooks(ctx, a.ID, hook.AudioDestroyPost, input, nil)
	return true, nil
}

func (r *mutationResolver) AudiosDestroy(ctx context.Context, input AudiosDestroyInput) (bool, error) {
	audioIDs, err := stringslice.StringSliceToIntSlice(input.Ids)
	if err != nil {
		return false, fmt.Errorf("converting ids: %w", err)
	}

	var audios []*models.Audio
	if err := r.withTxn(ctx, func(ctx context.Context) error {
		qb := r.repository.Audio
		for _, audioID := range audioIDs {
			a, err := qb.Find(ctx, audioID)
			if err != nil {
				return err
			}
			if a == nil {
				return fmt.Errorf("audio with id %d not found", audioID)
			}
			audios = append(audios, a)
			if err := qb.Destroy(ctx, audioID); err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		return false, err
	}

	for _, a := range audios {
		r.hookExecutor.ExecutePostHooks(ctx, a.ID, hook.AudioDestroyPost, input, nil)
	}
	return true, nil
}

func (r *mutationResolver) AudioIncrementO(ctx context.Context, id string) (ret int, err error) {
	audioID, err := strconv.Atoi(id)
	if err != nil {
		return 0, fmt.Errorf("converting id: %w", err)
	}

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		_, err = r.repository.Audio.AddO(ctx, audioID, []time.Time{time.Now()})
		if err != nil {
			return err
		}
		ret, err = r.repository.Audio.GetOCount(ctx, audioID)
		return err
	}); err != nil {
		return 0, err
	}
	return ret, nil
}

func (r *mutationResolver) AudioDecrementO(ctx context.Context, id string) (ret int, err error) {
	audioID, err := strconv.Atoi(id)
	if err != nil {
		return 0, fmt.Errorf("converting id: %w", err)
	}

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		_, err = r.repository.Audio.DeleteO(ctx, audioID, nil)
		if err != nil {
			return err
		}
		ret, err = r.repository.Audio.GetOCount(ctx, audioID)
		return err
	}); err != nil {
		return 0, err
	}
	return ret, nil
}

func (r *mutationResolver) AudioResetO(ctx context.Context, id string) (ret int, err error) {
	audioID, err := strconv.Atoi(id)
	if err != nil {
		return 0, fmt.Errorf("converting id: %w", err)
	}

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		ret, err = r.repository.Audio.ResetO(ctx, audioID)
		return err
	}); err != nil {
		return 0, err
	}
	return ret, nil
}

func (r *mutationResolver) AudioSaveActivity(ctx context.Context, id string, resumeTime *float64, playDuration *float64) (ret bool, err error) {
	audioID, err := strconv.Atoi(id)
	if err != nil {
		return false, fmt.Errorf("converting id: %w", err)
	}

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		ret, err = r.repository.Audio.SaveActivity(ctx, audioID, resumeTime, playDuration)
		return err
	}); err != nil {
		return false, err
	}
	return ret, nil
}

func (r *mutationResolver) AudioIncrementPlayCount(ctx context.Context, id string) (ret int, err error) {
	audioID, err := strconv.Atoi(id)
	if err != nil {
		return 0, fmt.Errorf("converting id: %w", err)
	}

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		_, err = r.repository.Audio.AddViews(ctx, audioID, []time.Time{time.Now()})
		if err != nil {
			return err
		}
		ret, err = r.repository.Audio.CountViews(ctx, audioID)
		return err
	}); err != nil {
		return 0, err
	}
	return ret, nil
}

func (r *mutationResolver) AudioAssignFile(ctx context.Context, input AssignAudioFileInput) (bool, error) {
	audioID, err := strconv.Atoi(input.AudioID)
	if err != nil {
		return false, fmt.Errorf("converting audio id: %w", err)
	}
	fileID, err := strconv.Atoi(input.FileID)
	if err != nil {
		return false, fmt.Errorf("converting file id: %w", err)
	}

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		return r.repository.Audio.AddFileID(ctx, audioID, models.FileID(fileID))
	}); err != nil {
		return false, err
	}
	return true, nil
}
