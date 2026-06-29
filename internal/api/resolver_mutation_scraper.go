package api

import (
	"context"
)

func (r *mutationResolver) ReloadScrapers(ctx context.Context) (bool, error) {
	return true, nil
}
