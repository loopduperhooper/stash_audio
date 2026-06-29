package api

import (
	"github.com/stashapp/stash_audio/pkg/models"
	"github.com/stashapp/stash_audio/pkg/sliceutil"
)

func stashIDsSliceToPtrSlice(v []models.StashID) []*models.StashID {
	return sliceutil.ValuesToPtrs(v)
}
