package match

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/stashapp/stash_audio/pkg/models"
)

// PathToAudiosFn finds audios in the given paths whose path matches name, then calls fn for each.
func PathToAudiosFn(ctx context.Context, name string, paths []string, audioReader models.AudioQueryer, fn func(ctx context.Context, a *models.Audio) error) error {
	regex := getPathQueryRegex(name)
	organized := false
	filter := models.AudioFilterType{
		Path: &models.StringCriterionInput{
			Value:    "(?i)" + regex,
			Modifier: models.CriterionModifierMatchesRegex,
		},
		Organized: &organized,
	}

	if pathsFilter := audioPathsFilter(paths); pathsFilter != nil {
		filter.And = pathsFilter
	}

	pp := 1000
	sort := "id"
	sortDir := models.SortDirectionEnumAsc
	lastID := 0

	for {
		if lastID != 0 {
			filter.ID = &models.IntCriterionInput{
				Value:    lastID,
				Modifier: models.CriterionModifierGreaterThan,
			}
		}

		result, err := audioReader.Query(ctx, models.AudioQueryOptions{
			AudioFilter: &filter,
			QueryOptions: models.QueryOptions{
				FindFilter: &models.FindFilterType{
					PerPage:   &pp,
					Sort:      &sort,
					Direction: &sortDir,
				},
			},
		})
		if err != nil {
			return fmt.Errorf("querying audios with regex %q: %w", regex, err)
		}

		audios, err := result.Resolve(ctx)
		if err != nil {
			return fmt.Errorf("resolving audio query: %w", err)
		}

		if len(audios) == 0 {
			break
		}

		const useUnicode = true
		r := nameToRegexp(name, useUnicode)
		for _, a := range audios {
			if regexpMatchesPath(r, a.Path) != -1 {
				if err := fn(ctx, a); err != nil {
					return err
				}
			}
		}

		if len(audios) < pp {
			break
		}

		lastID = audios[len(audios)-1].ID
	}

	return nil
}

func audioPathsFilter(paths []string) *models.AudioFilterType {
	if len(paths) == 0 {
		return nil
	}

	escapedPaths := make([]string, len(paths))
	for i, p := range paths {
		escapedPaths[i] = regexp.QuoteMeta(p)
	}

	return &models.AudioFilterType{
		Path: &models.StringCriterionInput{
			Value:    "(?i)(" + strings.Join(escapedPaths, "|") + ")",
			Modifier: models.CriterionModifierMatchesRegex,
		},
	}
}
