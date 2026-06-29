package api

import (
	"context"

	"github.com/stashapp/stash_audio/internal/manager"
	"github.com/stashapp/stash_audio/pkg/plugin"
)

func (r *queryResolver) Plugins(ctx context.Context) ([]*plugin.Plugin, error) {
	return manager.GetInstance().PluginCache.ListPlugins(), nil
}

func (r *queryResolver) PluginTasks(ctx context.Context) ([]*plugin.PluginTask, error) {
	return manager.GetInstance().PluginCache.ListPluginTasks(), nil
}
