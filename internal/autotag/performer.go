package autotag

import (
	"github.com/stashapp/stash_audio/pkg/match"
	"github.com/stashapp/stash_audio/pkg/models"
)

func getPerformerTaggers(p *models.Performer, cache *match.Cache) []tagger {
	ret := []tagger{{
		ID:    p.ID,
		Type:  "performer",
		Name:  p.Name,
		cache: cache,
	}}

	// TODO - disabled until we can have finer control over alias matching
	// for _, a := range p.Aliases.List() {
	// 	ret = append(ret, tagger{
	// 		ID:    p.ID,
	// 		Type:  "performer",
	// 		Name:  a,
	// 		cache: cache,
	// 	})
	// }

	return ret
}

