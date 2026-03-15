package sqlite

import (
	"context"

	"github.com/stashapp/stash/pkg/models"
)

type audioFilterHandler struct {
	audioFilter *models.AudioFilterType
}

func (qb *audioFilterHandler) validate() error {
	audioFilter := qb.audioFilter
	if audioFilter == nil {
		return nil
	}

	if err := validateFilterCombination(audioFilter.OperatorFilter); err != nil {
		return err
	}

	if subFilter := audioFilter.SubFilter(); subFilter != nil {
		sqb := &audioFilterHandler{audioFilter: subFilter}
		if err := sqb.validate(); err != nil {
			return err
		}
	}

	return nil
}

func (qb *audioFilterHandler) handle(ctx context.Context, f *filterBuilder) {
	audioFilter := qb.audioFilter
	if audioFilter == nil {
		return
	}

	if err := qb.validate(); err != nil {
		f.setError(err)
		return
	}

	sf := audioFilter.SubFilter()
	if sf != nil {
		sub := &audioFilterHandler{sf}
		handleSubFilter(ctx, sub, f, audioFilter.OperatorFilter)
	}

	// TODO: implement audio-specific filter criteria
}
