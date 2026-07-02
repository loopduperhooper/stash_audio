package autotag

import (
	"github.com/stashapp/stash_audio/pkg/match"
	"github.com/stashapp/stash_audio/pkg/models"
)

func getStudioTagger(p *models.Studio, aliases []string, cache *match.Cache) []tagger {
	ret := []tagger{{
		ID:    p.ID,
		Type:  "studio",
		Name:  p.Name,
		cache: cache,
	}}

	for _, a := range aliases {
		ret = append(ret, tagger{
			ID:   p.ID,
			Type: "studio",
			Name: a,
		})
	}

	return ret
}
