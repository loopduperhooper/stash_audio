package api

import (
	"context"

	"github.com/stashapp/stash_audio/internal/manager"
)

func (r *queryResolver) SystemStatus(ctx context.Context) (*manager.SystemStatus, error) {
	return manager.GetInstance().GetSystemStatus(), nil
}
