package plugin

import (
	"github.com/stashapp/stash_audio/pkg/plugin/common"
)

func toPluginArgs(args OperationInput) common.ArgsMap {
	ret := make(common.ArgsMap)
	for k, a := range args {
		ret[k] = common.PluginArgValue(a)
	}

	return ret
}
