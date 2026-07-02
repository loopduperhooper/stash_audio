package sqlite

import (
	"context"
	"fmt"

	"github.com/stashapp/stash_audio/pkg/models"
	"github.com/stashapp/stash_audio/pkg/utils"
)

type fileFilterHandler struct {
	fileFilter *models.FileFilterType
	// if true, don't allow use of related filters
	isRelated bool
}

func (qb *fileFilterHandler) validate() error {
	fileFilter := qb.fileFilter
	if fileFilter == nil {
		return nil
	}

	if err := validateFilterCombination(fileFilter.OperatorFilter); err != nil {
		return err
	}

	if subFilter := fileFilter.SubFilter(); subFilter != nil {
		sqb := &fileFilterHandler{fileFilter: subFilter, isRelated: qb.isRelated}
		if err := sqb.validate(); err != nil {
			return err
		}
	}

	return nil
}

func (qb *fileFilterHandler) handle(ctx context.Context, f *filterBuilder) {
	fileFilter := qb.fileFilter
	if fileFilter == nil {
		return
	}

	if err := qb.validate(); err != nil {
		f.setError(err)
		return
	}

	sf := fileFilter.SubFilter()
	if sf != nil {
		sub := &fileFilterHandler{sf, qb.isRelated}
		handleSubFilter(ctx, sub, f, fileFilter.OperatorFilter)
	}

	f.handleCriterion(ctx, qb.criterionHandler())
}

func (qb *fileFilterHandler) criterionHandler() criterionHandler {
	fileFilter := qb.fileFilter
	return compoundHandler{
		pathCriterionHandler(fileFilter.Path, "folders.path", "files.basename", nil),
		stringCriterionHandler(fileFilter.Basename, "files.basename"),
		stringCriterionHandler(fileFilter.Dir, "folders.path"),
		&timestampCriterionHandler{fileFilter.ModTime, "files.mod_time", nil},

		qb.parentFolderCriterionHandler(fileFilter.ParentFolder),
		qb.zipFileCriterionHandler(fileFilter.ZipFile),

		qb.hashesCriterionHandler(fileFilter.Hashes),

		&timestampCriterionHandler{fileFilter.CreatedAt, "files.created_at", nil},
		&timestampCriterionHandler{fileFilter.UpdatedAt, "files.updated_at", nil},
	}
}

func (qb *fileFilterHandler) zipFileCriterionHandler(criterion *models.MultiCriterionInput) criterionHandlerFunc {
	return func(ctx context.Context, f *filterBuilder) {
		if criterion != nil {
			if criterion.Modifier == models.CriterionModifierIsNull || criterion.Modifier == models.CriterionModifierNotNull {
				var notClause string
				if criterion.Modifier == models.CriterionModifierNotNull {
					notClause = "NOT"
				}

				f.addWhere(fmt.Sprintf("files.zip_file_id IS %s NULL", notClause))
				return
			}

			if len(criterion.Value) == 0 {
				return
			}

			var args []interface{}
			for _, tagID := range criterion.Value {
				args = append(args, tagID)
			}

			whereClause := ""
			havingClause := ""
			switch criterion.Modifier {
			case models.CriterionModifierIncludes:
				whereClause = "files.zip_file_id IN " + getInBinding(len(criterion.Value))
			case models.CriterionModifierExcludes:
				whereClause = "files.zip_file_id NOT IN " + getInBinding(len(criterion.Value))
			}

			f.addWhere(whereClause, args...)
			f.addHaving(havingClause)
		}
	}
}

func (qb *fileFilterHandler) parentFolderCriterionHandler(folder *models.HierarchicalMultiCriterionInput) criterionHandlerFunc {
	return func(ctx context.Context, f *filterBuilder) {
		if folder == nil {
			return
		}

		folderCopy := *folder
		switch folderCopy.Modifier {
		case models.CriterionModifierEquals:
			folderCopy.Modifier = models.CriterionModifierIncludesAll
		case models.CriterionModifierNotEquals:
			folderCopy.Modifier = models.CriterionModifierExcludes
		}

		hh := hierarchicalMultiCriterionHandlerBuilder{
			primaryTable: fileTable,
			foreignTable: folderTable,
			foreignFK:    "parent_folder_id",
			parentFK:     "parent_folder_id",
		}

		hh.handler(&folderCopy)(ctx, f)
	}
}


func (qb *fileFilterHandler) hashesCriterionHandler(hashes []*models.FingerprintFilterInput) criterionHandlerFunc {
	return func(ctx context.Context, f *filterBuilder) {
		// TODO - this won't work for AND/OR combinations
		for i, hash := range hashes {
			t := fmt.Sprintf("file_fingerprints_%d", i)
			f.addLeftJoin(fingerprintTable, t, fmt.Sprintf("files.id = %s.file_id AND %s.type = ?", t, t), hash.Type)

			distance := 0
			if hash.Distance != nil {
				distance = *hash.Distance
			}

			// Only phash supports distance matching and is stored as integer
			if hash.Type == models.FingerprintTypePhash {
				value, err := utils.StringToPhash(hash.Value)
				if err != nil {
					f.setError(fmt.Errorf("invalid phash value: %w", err))
					return
				}
				if distance > 0 {
					// needed to avoid a type mismatch
					f.addWhere(fmt.Sprintf("typeof(%s.fingerprint) = 'integer'", t))
					f.addWhere(fmt.Sprintf("phash_distance(%s.fingerprint, ?) < ?", t), value, distance)
				} else {
					intCriterionHandler(&models.IntCriterionInput{
						Value:    int(value),
						Modifier: models.CriterionModifierEquals,
					}, t+".fingerprint", nil)(ctx, f)
				}
			} else {
				// All other fingerprint types (md5, oshash, sha1, etc.) are stored as strings
				// Use exact match for string-based fingerprints
				f.addWhere(fmt.Sprintf("%s.fingerprint = ?", t), hash.Value)
			}
		}
	}
}

