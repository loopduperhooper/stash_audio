package api

import (
	"context"

	"github.com/stashapp/stash_audio/pkg/models"
)

func (r *savedFilterResolver) Filter(ctx context.Context, obj *models.SavedFilter) (string, error) {
	return "", nil
}
