package sqlite

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/stashapp/stash_audio/pkg/models"
	"github.com/stashapp/stash_audio/pkg/utils"
)

type performerFilterHandler struct {
	performerFilter *models.PerformerFilterType
}

func (qb *performerFilterHandler) validate() error {
	filter := qb.performerFilter
	if filter == nil {
		return nil
	}

	if err := validateFilterCombination(filter.OperatorFilter); err != nil {
		return err
	}

	if subFilter := filter.SubFilter(); subFilter != nil {
		sqb := &performerFilterHandler{performerFilter: subFilter}
		if err := sqb.validate(); err != nil {
			return err
		}
	}

	// if legacy height filter used, ensure only supported modifiers are used
	if filter.Height != nil {
		// treat as an int filter
		intCrit := &models.IntCriterionInput{
			Modifier: filter.Height.Modifier,
		}
		if !intCrit.ValidModifier() {
			return fmt.Errorf("invalid height modifier: %s", filter.Height.Modifier)
		}

		// ensure value is a valid number
		if _, err := strconv.Atoi(filter.Height.Value); err != nil {
			return fmt.Errorf("invalid height value: %s", filter.Height.Value)
		}
	}

	// if legacy career length filter used, ensure only supported modifiers are used and value is valid
	if filter.CareerLength != nil {
		careerLength := filter.CareerLength
		switch careerLength.Modifier {
		case models.CriterionModifierEquals:
			start, end, err := utils.ParseYearRangeString(careerLength.Value)
			if err != nil {
				return fmt.Errorf("invalid career length value: %s", careerLength.Value)
			}
			// ensure career start/end is not set
			if start != nil && filter.CareerStart != nil {
				return fmt.Errorf("cannot use legacy CareerLength filter with CareerStart filter")
			}
			if end != nil && filter.CareerEnd != nil {
				return fmt.Errorf("cannot use legacy CareerLength filter with CareerEnd filter")
			}
		case models.CriterionModifierIsNull, models.CriterionModifierNotNull:
			// valid modifiers, no value parsing needed
		default:
			return fmt.Errorf("invalid career length modifier: %s", careerLength.Modifier)
		}
	}

	return nil
}

func (qb *performerFilterHandler) handle(ctx context.Context, f *filterBuilder) {
	filter := qb.performerFilter
	if filter == nil {
		return
	}

	if err := qb.validate(); err != nil {
		f.setError(err)
		return
	}

	sf := filter.SubFilter()
	if sf != nil {
		sub := &performerFilterHandler{sf}
		handleSubFilter(ctx, sub, f, filter.OperatorFilter)
	}

	f.handleCriterion(ctx, qb.criterionHandler())
}

func (qb *performerFilterHandler) criterionHandler() criterionHandler {
	// make a copy of the filter to modify with legacy conversions without affecting original filter used for subfilters
	filter := *qb.performerFilter
	const tableName = performerTable
	heightCmCrit := filter.HeightCm

	convertLegacyCareerLengthFilter(&filter)

	return compoundHandler{
		stringCriterionHandler(filter.Name, tableName+".name"),
		stringCriterionHandler(filter.Disambiguation, tableName+".disambiguation"),
		stringCriterionHandler(filter.Details, tableName+".details"),

		boolCriterionHandler(filter.FilterFavorites, tableName+".favorite", nil),
		boolCriterionHandler(filter.IgnoreAutoTag, tableName+".ignore_auto_tag", nil),

		yearFilterCriterionHandler(filter.BirthYear, tableName+".birthdate"),
		yearFilterCriterionHandler(filter.DeathYear, tableName+".death_date"),

		qb.performerAgeFilterCriterionHandler(filter.Age),

		criterionHandlerFunc(func(ctx context.Context, f *filterBuilder) {
			if gender := filter.Gender; gender != nil {
				genderCopy := *gender
				if genderCopy.Value.IsValid() && len(genderCopy.ValueList) == 0 {
					genderCopy.ValueList = []models.GenderEnum{genderCopy.Value}
				}

				v := utils.StringerSliceToStringSlice(genderCopy.ValueList)
				enumCriterionHandler(genderCopy.Modifier, v, tableName+".gender")(ctx, f)
			}
		}),

		qb.performerIsMissingCriterionHandler(filter.IsMissing),
		stringCriterionHandler(filter.Ethnicity, tableName+".ethnicity"),
		stringCriterionHandler(filter.Country, tableName+".country"),
		stringCriterionHandler(filter.EyeColor, tableName+".eye_color"),

		// special handler for legacy height filter
		criterionHandlerFunc(func(ctx context.Context, f *filterBuilder) {
			if heightCmCrit == nil && filter.Height != nil {
				heightCm, _ := strconv.Atoi(filter.Height.Value) // already validated
				heightCmCrit = &models.IntCriterionInput{
					Value:    heightCm,
					Modifier: filter.Height.Modifier,
				}
			}
		}),

		intCriterionHandler(heightCmCrit, tableName+".height", nil),

		stringCriterionHandler(filter.Measurements, tableName+".measurements"),
		stringCriterionHandler(filter.FakeTits, tableName+".fake_tits"),
		floatCriterionHandler(filter.PenisLength, tableName+".penis_length", nil),

		criterionHandlerFunc(func(ctx context.Context, f *filterBuilder) {
			if circumcised := filter.Circumcised; circumcised != nil {
				v := utils.StringerSliceToStringSlice(circumcised.Value)
				enumCriterionHandler(circumcised.Modifier, v, tableName+".circumcised")(ctx, f)
			}
		}),

		// CareerLength filter is deprecated and non-functional (column removed in schema 78)
		intCriterionHandler(filter.CareerStart, tableName+".career_start", nil),
		intCriterionHandler(filter.CareerEnd, tableName+".career_end", nil),
		stringCriterionHandler(filter.Tattoos, tableName+".tattoos"),
		stringCriterionHandler(filter.Piercings, tableName+".piercings"),
		intCriterionHandler(filter.Rating100, tableName+".rating", nil),
		stringCriterionHandler(filter.HairColor, tableName+".hair_color"),
		qb.urlsCriterionHandler(filter.URL),
		intCriterionHandler(filter.Weight, tableName+".weight", nil),
		criterionHandlerFunc(func(ctx context.Context, f *filterBuilder) {
			if filter.StashID != nil {
				performerRepository.stashIDs.join(f, "performer_stash_ids", "performers.id")
				stringCriterionHandler(filter.StashID, "performer_stash_ids.stash_id")(ctx, f)
			}
		}),
		&stashIDCriterionHandler{
			c:                 filter.StashIDEndpoint,
			stashIDRepository: &performerRepository.stashIDs,
			stashIDTableAs:    "performer_stash_ids",
			parentIDCol:       "performers.id",
		},
		&stashIDsCriterionHandler{
			c:                 filter.StashIDsEndpoint,
			stashIDRepository: &performerRepository.stashIDs,
			stashIDTableAs:    "performer_stash_ids",
			parentIDCol:       "performers.id",
		},

		qb.aliasCriterionHandler(filter.Aliases),

		qb.tagsCriterionHandler(filter.Tags),

		qb.studiosCriterionHandler(filter.Studios),

		qb.groupsCriterionHandler(filter.Groups),

		qb.appearsWithCriterionHandler(filter.Performers),

		qb.tagCountCriterionHandler(filter.TagCount),
		qb.audioCountCriterionHandler(filter.AudioCount),
		qb.groupCountCriterionHandler(filter.GroupCount),
		&dateCriterionHandler{filter.Birthdate, tableName + ".birthdate", nil},
		&dateCriterionHandler{filter.DeathDate, tableName + ".death_date", nil},
		&timestampCriterionHandler{filter.CreatedAt, tableName + ".created_at", nil},
		&timestampCriterionHandler{filter.UpdatedAt, tableName + ".updated_at", nil},

		&relatedFilterHandler{
			relatedIDCol:   "performer_tag.tag_id",
			relatedRepo:    tagRepository.repository,
			relatedHandler: &tagFilterHandler{filter.TagsFilter},
			joinFn: func(f *filterBuilder) {
				performerRepository.tags.innerJoin(f, "performer_tag", "performers.id")
			},
		},

		&customFieldsFilterHandler{
			table: performersCustomFieldsTable.GetTable(),
			fkCol: performerIDColumn,
			c:     filter.CustomFields,
			idCol: "performers.id",
		},
	}
}

func convertLegacyCareerLengthFilter(filter *models.PerformerFilterType) {
	// convert legacy career length filter to career start/end filters
	if filter.CareerLength != nil {
		careerLength := filter.CareerLength
		switch careerLength.Modifier {
		case models.CriterionModifierEquals:
			start, end, _ := utils.ParseYearRangeString(careerLength.Value)
			if start != nil {
				filter.CareerStart = &models.IntCriterionInput{
					Value:    (*start) - 1, // minus one to make it exclusive
					Modifier: models.CriterionModifierGreaterThan,
				}
			}
			if end != nil {
				filter.CareerEnd = &models.IntCriterionInput{
					Value:    (*end) + 1, // plus one to make it exclusive
					Modifier: models.CriterionModifierLessThan,
				}
			}
		case models.CriterionModifierIsNull:
			filter.CareerStart = &models.IntCriterionInput{
				Modifier: models.CriterionModifierIsNull,
			}
			filter.CareerEnd = &models.IntCriterionInput{
				Modifier: models.CriterionModifierIsNull,
			}
		case models.CriterionModifierNotNull:
			filter.CareerStart = &models.IntCriterionInput{
				Modifier: models.CriterionModifierNotNull,
			}
			filter.CareerEnd = &models.IntCriterionInput{
				Modifier: models.CriterionModifierNotNull,
			}
		}
	}
}

// TODO - we need to provide a whitelist of possible values
func (qb *performerFilterHandler) performerIsMissingCriterionHandler(isMissing *string) criterionHandlerFunc {
	return func(ctx context.Context, f *filterBuilder) {
		if isMissing != nil && *isMissing != "" {
			switch *isMissing {
			case "url":
				performersURLsTableMgr.join(f, "", "performers.id")
				f.addWhere("performer_urls.url IS NULL")
			case "image":
				f.addWhere("performers.image_blob IS NULL")
			case "stash_id":
				performersStashIDsTableMgr.join(f, "performer_stash_ids", "performers.id")
				f.addWhere("performer_stash_ids.performer_id IS NULL")
			case "aliases":
				performersAliasesTableMgr.join(f, "", "performers.id")
				f.addWhere("performer_aliases.alias IS NULL")
			case "tags":
				f.addLeftJoin(performersTagsTable, "tags_join", "tags_join.performer_id = performers.id")
				f.addWhere("tags_join.performer_id IS NULL")
			default:
				if err := validateIsMissing(*isMissing, []string{
					"disambiguation", "gender", "birthdate", "death_date",
					"ethnicity", "country", "hair_color", "eye_color", "height", "weight",
					"measurements", "fake_tits", "penis_length", "circumcised",
					"career_start", "career_end", "tattoos", "piercings", "details", "rating",
				}); err != nil {
					f.setError(err)
					return
				}
				f.addWhere("(performers." + *isMissing + " IS NULL OR TRIM(performers." + *isMissing + ") = '')")
			}
		}
	}
}

func (qb *performerFilterHandler) performerAgeFilterCriterionHandler(age *models.IntCriterionInput) criterionHandlerFunc {
	return func(ctx context.Context, f *filterBuilder) {
		if age != nil && age.Modifier.IsValid() {
			clause, args := getIntCriterionWhereClause(
				"cast(IFNULL(strftime('%Y.%m%d', performers.death_date), strftime('%Y.%m%d', 'now')) - strftime('%Y.%m%d', performers.birthdate) as int)",
				*age,
			)
			f.addWhere(clause, args...)
		}
	}
}

func (qb *performerFilterHandler) urlsCriterionHandler(url *models.StringCriterionInput) criterionHandlerFunc {
	h := stringListCriterionHandlerBuilder{
		primaryTable: performerTable,
		primaryFK:    performerIDColumn,
		joinTable:    performerURLsTable,
		stringColumn: performerURLColumn,
		addJoinTable: func(f *filterBuilder) {
			performersURLsTableMgr.join(f, "", "performers.id")
		},
	}

	return h.handler(url)
}

func (qb *performerFilterHandler) aliasCriterionHandler(alias *models.StringCriterionInput) criterionHandlerFunc {
	h := stringListCriterionHandlerBuilder{
		primaryTable: performerTable,
		primaryFK:    performerIDColumn,
		joinTable:    performersAliasesTable,
		stringColumn: performerAliasColumn,
		addJoinTable: func(f *filterBuilder) {
			performersAliasesTableMgr.join(f, "", "performers.id")
		},
	}

	return h.handler(alias)
}

func (qb *performerFilterHandler) tagsCriterionHandler(tags *models.HierarchicalMultiCriterionInput) criterionHandlerFunc {
	h := joinedHierarchicalMultiCriterionHandlerBuilder{
		primaryTable: performerTable,
		foreignTable: tagTable,
		foreignFK:    "tag_id",

		relationsTable: "tags_relations",
		joinAs:         "performer_tag",
		joinTable:      performersTagsTable,
		primaryFK:      performerIDColumn,
	}

	return h.handler(tags)
}

func (qb *performerFilterHandler) tagCountCriterionHandler(count *models.IntCriterionInput) criterionHandlerFunc {
	h := countCriterionHandlerBuilder{
		primaryTable: performerTable,
		joinTable:    performersTagsTable,
		primaryFK:    performerIDColumn,
	}

	return h.handler(count)
}

func (qb *performerFilterHandler) audioCountCriterionHandler(count *models.IntCriterionInput) criterionHandlerFunc {
	h := countCriterionHandlerBuilder{
		primaryTable: performerTable,
		joinTable:    performersAudiosTable,
		primaryFK:    performerIDColumn,
	}
	return h.handler(count)
}

func (qb *performerFilterHandler) groupCountCriterionHandler(count *models.IntCriterionInput) criterionHandlerFunc {
	h := countCriterionHandlerBuilder{
		primaryTable: performerTable,
		joinTable:    performersGroupsTable,
		primaryFK:    performerIDColumn,
	}
	return h.handler(count)
}

func (qb *performerFilterHandler) studiosCriterionHandler(studios *models.HierarchicalMultiCriterionInput) criterionHandlerFunc {
	return func(ctx context.Context, f *filterBuilder) {
		if studios == nil {
			return
		}

		if studios.Modifier == models.CriterionModifierIsNull || studios.Modifier == models.CriterionModifierNotNull {
			var notClause string
			if studios.Modifier == models.CriterionModifierNotNull {
				notClause = "NOT"
			}
			f.addLeftJoin(performersAudiosTable, "pa_studio", "pa_studio.performer_id = performers.id")
			f.addLeftJoin(audioTable, "a_studio", "pa_studio.audio_id = a_studio.id")
			f.addWhere(fmt.Sprintf("%s a_studio.studio_id IS NULL", notClause))
			return
		}

		if len(studios.Value) == 0 && len(studios.Excludes) == 0 {
			return
		}

		var clauseCondition string
		switch studios.Modifier {
		case models.CriterionModifierIncludes:
			clauseCondition = "NOT"
		case models.CriterionModifierExcludes:
			clauseCondition = ""
		default:
			return
		}

		if len(studios.Value) > 0 {
			const derivedPerformerStudioTable = "performer_studio"
			valuesClause, err := getHierarchicalValues(ctx, studios.Value, studioTable, "", "parent_id", "child_id", studios.Depth)
			if err != nil {
				f.setError(err)
				return
			}
			f.addWith("studio(root_id, item_id) AS (" + valuesClause + ")")
			f.addWith(fmt.Sprintf(`%s AS (
				SELECT performer_id FROM %s
				INNER JOIN %s ON %s.id = %s.audio_id
				INNER JOIN studio ON %s.studio_id = studio.item_id
			)`, derivedPerformerStudioTable, performersAudiosTable, audioTable, audioTable, performersAudiosTable, audioTable))
			f.addLeftJoin(derivedPerformerStudioTable, "", fmt.Sprintf("performers.id = %s.performer_id", derivedPerformerStudioTable))
			f.addWhere(fmt.Sprintf("%s.performer_id IS %s NULL", derivedPerformerStudioTable, clauseCondition))
		}

		if len(studios.Excludes) > 0 {
			excludeValuesClause, err := getHierarchicalValues(ctx, studios.Excludes, studioTable, "", "parent_id", "child_id", studios.Depth)
			if err != nil {
				f.setError(err)
				return
			}
			f.addWith("exclude_studio(root_id, item_id) AS (" + excludeValuesClause + ")")
			const excludePerformerStudioTable = "performer_studio_exclude"
			f.addWith(fmt.Sprintf(`%s AS (
				SELECT performer_id FROM %s
				INNER JOIN %s ON %s.id = %s.audio_id
				INNER JOIN exclude_studio ON %s.studio_id = exclude_studio.item_id
			)`, excludePerformerStudioTable, performersAudiosTable, audioTable, audioTable, performersAudiosTable, audioTable))
			f.addLeftJoin(excludePerformerStudioTable, "", fmt.Sprintf("performers.id = %s.performer_id", excludePerformerStudioTable))
			f.addWhere(fmt.Sprintf("%s.performer_id IS NULL", excludePerformerStudioTable))
		}
	}
}

func (qb *performerFilterHandler) groupsCriterionHandler(groups *models.HierarchicalMultiCriterionInput) criterionHandlerFunc {
	return func(ctx context.Context, f *filterBuilder) {
		if groups == nil {
			return
		}

		if groups.Modifier == models.CriterionModifierIsNull || groups.Modifier == models.CriterionModifierNotNull {
			var notClause string
			if groups.Modifier == models.CriterionModifierNotNull {
				notClause = "NOT"
			}
			f.addLeftJoin(performersGroupsTable, "pg_null", "pg_null.performer_id = performers.id")
			f.addWhere(fmt.Sprintf("%s pg_null.group_id IS NULL", notClause))
			return
		}

		if len(groups.Value) == 0 {
			return
		}

		var clauseCondition string
		switch groups.Modifier {
		case models.CriterionModifierIncludes:
			clauseCondition = "NOT"
		case models.CriterionModifierExcludes:
			clauseCondition = ""
		default:
			return
		}

		const derivedPerformerGroupTable = "performer_group"

		var args []interface{}
		for _, val := range groups.Value {
			args = append(args, val)
		}

		depthVal := 0
		if groups.Depth != nil {
			depthVal = *groups.Depth
		}

		if depthVal == 0 {
			f.addWith(fmt.Sprintf("group_values(id) AS (VALUES %s)", strings.Repeat("(?),", len(groups.Value)-1)+"(?)"), args...)
			f.addWith(fmt.Sprintf(`%s AS (
				SELECT performer_id FROM %s
				INNER JOIN group_values ON %s.group_id = group_values.id
			)`, derivedPerformerGroupTable, performersGroupsTable, performersGroupsTable))
		} else {
			var depthCondition string
			if depthVal != -1 {
				depthCondition = fmt.Sprintf("WHERE depth < %d", depthVal)
			}
			hierarchyQuery := fmt.Sprintf(`group_hierarchy AS (
SELECT sub_id AS root_id, sub_id AS item_id, 0 AS depth FROM groups_relations WHERE sub_id IN%s
UNION
SELECT root_id, sub_id, depth + 1 FROM groups_relations INNER JOIN group_hierarchy ON item_id = containing_id %s
)`, getInBinding(len(groups.Value)), depthCondition)
			f.addRecursiveWith(hierarchyQuery, args...)
			f.addWith(fmt.Sprintf(`%s AS (
				SELECT performer_id FROM %s
				INNER JOIN group_hierarchy ON %s.group_id = group_hierarchy.item_id
			)`, derivedPerformerGroupTable, performersGroupsTable, performersGroupsTable))
		}

		f.addLeftJoin(derivedPerformerGroupTable, "", fmt.Sprintf("performers.id = %s.performer_id", derivedPerformerGroupTable))
		f.addWhere(fmt.Sprintf("%s.performer_id IS %s NULL", derivedPerformerGroupTable, clauseCondition))
	}
}

func (qb *performerFilterHandler) appearsWithCriterionHandler(performers *models.MultiCriterionInput) criterionHandlerFunc {
	return func(ctx context.Context, f *filterBuilder) {
		if performers == nil || len(performers.Value) == 0 {
			return
		}

		const derivedPerformerPerformersTable = "performer_performers"
		valuesClause := strings.Join(performers.Value, "),(")
		f.addWith("performer(id) AS (VALUES(" + valuesClause + "))")

		templStr := `SELECT pa2.performer_id FROM ` + performersAudiosTable + ` pa
			INNER JOIN ` + performersAudiosTable + ` pa2 ON pa.audio_id = pa2.audio_id
			INNER JOIN performer ON pa.performer_id = performer.id
			WHERE pa2.performer_id != performer.id`

		if performers.Modifier == models.CriterionModifierIncludesAll && len(performers.Value) > 1 {
			templStr += `
				GROUP BY pa2.performer_id
				HAVING(count(distinct pa.performer_id) IS ` + strconv.Itoa(len(performers.Value)) + `)`
		}

		f.addWith(fmt.Sprintf("%s AS (%s)", derivedPerformerPerformersTable, templStr))
		f.addInnerJoin(derivedPerformerPerformersTable, "", fmt.Sprintf("performers.id = %s.performer_id", derivedPerformerPerformersTable))
	}
}
