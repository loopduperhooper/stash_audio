package autotag

import (
	"github.com/stashapp/stash_audio/pkg/match"
	"github.com/stashapp/stash_audio/pkg/models"
)

func getTagTaggers(p *models.Tag, aliases []string, cache *match.Cache) []tagger {
	ret := []tagger{{
		ID:    p.ID,
		Type:  "tag",
		Name:  p.Name,
		cache: cache,
	}}

	for _, a := range aliases {
		ret = append(ret, tagger{
			ID:    p.ID,
			Type:  "tag",
			Name:  a,
			cache: cache,
		})
	}

	return ret
}
