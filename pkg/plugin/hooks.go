package plugin

import (
	"github.com/stashapp/stash_audio/pkg/plugin/common"
)

type PluginHook struct {
	Name        string   `json:"name"`
	Description *string  `json:"description"`
	Hooks       []string `json:"hooks"`
	Plugin      *Plugin  `json:"plugin"`
}

func addHookContext(argsMap common.ArgsMap, hookContext common.HookContext) {
	argsMap[common.HookContextKey] = hookContext
}

// AudioDestroyInput is the hook input for audio destroy events and the GraphQL mutation input.
type AudioDestroyInput struct {
	ID              string `json:"id"`
	DeleteFile      *bool  `json:"delete_file"`
	DeleteGenerated *bool  `json:"delete_generated"`
}

// GalleryDestroyInput is kept as a stub so existing hook references compile.
type GalleryDestroyInput struct {
	Checksum string `json:"checksum"`
	Path     string `json:"path"`
}
