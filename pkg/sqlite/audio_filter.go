package sqlite

import (
	"context"

	"github.com/stashapp/stash/pkg/models"
)

type audioFilterHandler struct {
	audioFilter *models.AudioFilterType
}

func (qb *audioFilterHandler) validate() error {
	audioFilter := qb.audioFilter
	if audioFilter == nil {
		return nil
	}

	if err := validateFilterCombination(audioFilter.OperatorFilter); err != nil {
		return err
	}

	if subFilter := audioFilter.SubFilter(); subFilter != nil {
		sqb := &audioFilterHandler{audioFilter: subFilter}
		if err := sqb.validate(); err != nil {
			return err
		}
	}

	return nil
}

func (qb *audioFilterHandler) handle(ctx context.Context, f *filterBuilder) {
	audioFilter := qb.audioFilter
	if audioFilter == nil {
		return
	}

	if err := qb.validate(); err != nil {
		f.setError(err)
		return
	}

	sf := audioFilter.SubFilter()
	if sf != nil {
		sub := &audioFilterHandler{sf}
		handleSubFilter(ctx, sub, f, audioFilter.OperatorFilter)
	}

	f.handleCriterion(ctx, qb.criterionHandler())
}

func (qb *audioFilterHandler) criterionHandler() criterionHandler {
	af := qb.audioFilter
	return compoundHandler{
		intCriterionHandler(af.ID, "audios.id", nil),
		stringCriterionHandler(af.Title, "audios.title"),
		stringCriterionHandler(af.Details, "audios.details"),
		pathCriterionHandler(af.Path, "folders.path", "files.basename", qb.addFoldersTable),
		qb.fileCountCriterionHandler(af.FileCount),

		criterionHandlerFunc(func(ctx context.Context, f *filterBuilder) {
			if af.Checksum != nil {
				qb.addAudioFilesTable(f)
				f.addLeftJoin(fingerprintTable, "fingerprints_md5", "audios_files.file_id = fingerprints_md5.file_id AND fingerprints_md5.type = 'md5'")
			}
			stringCriterionHandler(af.Checksum, "fingerprints_md5.fingerprint")(ctx, f)
		}),

		intCriterionHandler(af.Rating100, "audios.rating", nil),
		boolCriterionHandler(af.Organized, "audios.organized", nil),
		qb.oCountCriterionHandler(af.OCounter),

		floatIntCriterionHandler(af.Duration, "audio_files.duration", qb.addAudioFileMetaTable),
		intCriterionHandler(af.Bitrate, "audio_files.bit_rate", qb.addAudioFileMetaTable),
		qb.codecCriterionHandler(af.AudioCodec, "audio_files.audio_codec", qb.addAudioFileMetaTable),

		floatIntCriterionHandler(af.ResumeTime, "audios.resume_time", nil),
		floatIntCriterionHandler(af.PlayDuration, "audios.play_duration", nil),
		intCriterionHandler(af.PlayCount, "audios.play_count", nil),
		&timestampCriterionHandler{af.LastPlayedAt, "IFNULL(audios.last_played_at, datetime(0))", nil},

		qb.hasMarkersCriterionHandler(af.HasMarkers),
		qb.isMissingCriterionHandler(af.IsMissing),
		qb.urlsCriterionHandler(af.URL),

		criterionHandlerFunc(func(ctx context.Context, f *filterBuilder) {
			if af.StashID != nil {
				audioRepository.stashIDs.join(f, "audio_stash_ids", "audios.id")
				stringCriterionHandler(af.StashID, "audio_stash_ids.stash_id")(ctx, f)
			}
		}),
		&stashIDCriterionHandler{
			c:                 af.StashIDEndpoint,
			stashIDRepository: &audioRepository.stashIDs,
			stashIDTableAs:    "audio_stash_ids",
			parentIDCol:       "audios.id",
		},

		qb.tagsCriterionHandler(af.Tags),
		qb.tagCountCriterionHandler(af.TagCount),
		qb.performersCriterionHandler(af.Performers),
		qb.performerCountCriterionHandler(af.PerformerCount),
		studioCriterionHandler(audioTable, af.Studios),
		qb.performerTagsCriterionHandler(af.PerformerTags),
		qb.performerFavoriteCriterionHandler(af.PerformerFavorite),

		&dateCriterionHandler{af.Date, "audios.date", nil},
		&timestampCriterionHandler{af.CreatedAt, "audios.created_at", nil},
		&timestampCriterionHandler{af.UpdatedAt, "audios.updated_at", nil},

		&relatedFilterHandler{
			relatedIDCol:   "performers_join.performer_id",
			relatedRepo:    performerRepository.repository,
			relatedHandler: &performerFilterHandler{af.PerformersFilter},
			joinFn: func(f *filterBuilder) {
				audioRepository.performers.innerJoin(f, "performers_join", "audios.id")
			},
		},

		&relatedFilterHandler{
			relatedIDCol:   "audios.studio_id",
			relatedRepo:    studioRepository.repository,
			relatedHandler: &studioFilterHandler{af.StudiosFilter},
		},

		&relatedFilterHandler{
			relatedIDCol:   "audio_tag.tag_id",
			relatedRepo:    tagRepository.repository,
			relatedHandler: &tagFilterHandler{af.TagsFilter},
			joinFn: func(f *filterBuilder) {
				audioRepository.tags.innerJoin(f, "audio_tag", "audios.id")
			},
		},

		&relatedFilterHandler{
			relatedIDCol: "files.id",
			relatedRepo:  fileRepository.repository,
			relatedHandler: &fileFilterHandler{
				fileFilter: af.FilesFilter,
				isRelated:  true,
			},
			joinFn: func(f *filterBuilder) {
				qb.addFilesTable(f)
				qb.addFoldersTable(f)
			},
			directJoin: true,
		},
	}
}

func (qb *audioFilterHandler) codecCriterionHandler(codec *models.StringCriterionInput, codecColumn string, addJoinFn func(f *filterBuilder)) criterionHandlerFunc {
	return func(ctx context.Context, f *filterBuilder) {
		if codec != nil {
			if addJoinFn != nil {
				addJoinFn(f)
			}
			stringCriterionHandler(codec, codecColumn)(ctx, f)
		}
	}
}

func (qb *audioFilterHandler) addAudioFilesTable(f *filterBuilder) {
	f.addLeftJoin(audiosFilesTable, "", "audios_files.audio_id = audios.id")
}

func (qb *audioFilterHandler) addFilesTable(f *filterBuilder) {
	qb.addAudioFilesTable(f)
	f.addLeftJoin(fileTable, "", "audios_files.file_id = files.id")
}

func (qb *audioFilterHandler) addFoldersTable(f *filterBuilder) {
	qb.addFilesTable(f)
	f.addLeftJoin(folderTable, "", "files.parent_folder_id = folders.id")
}

func (qb *audioFilterHandler) addAudioFileMetaTable(f *filterBuilder) {
	qb.addAudioFilesTable(f)
	f.addLeftJoin("audio_files", "", "audio_files.file_id = audios_files.file_id")
}

func (qb *audioFilterHandler) fileCountCriterionHandler(fileCount *models.IntCriterionInput) criterionHandlerFunc {
	h := countCriterionHandlerBuilder{
		primaryTable: audioTable,
		joinTable:    audiosFilesTable,
		primaryFK:    audioIDColumn,
	}
	return h.handler(fileCount)
}

func (qb *audioFilterHandler) oCountCriterionHandler(count *models.IntCriterionInput) criterionHandlerFunc {
	h := countCriterionHandlerBuilder{
		primaryTable: audioTable,
		joinTable:    audiosODatesTable,
		primaryFK:    audioIDColumn,
	}
	return h.handler(count)
}

func (qb *audioFilterHandler) hasMarkersCriterionHandler(hasMarkers *string) criterionHandlerFunc {
	return func(ctx context.Context, f *filterBuilder) {
		if hasMarkers != nil {
			f.addLeftJoin("audio_markers", "", "audio_markers.audio_id = audios.id")
			if *hasMarkers == "true" {
				f.addHaving("count(audio_markers.audio_id) > 0")
			} else {
				f.addWhere("audio_markers.id IS NULL")
			}
		}
	}
}

func (qb *audioFilterHandler) isMissingCriterionHandler(isMissing *string) criterionHandlerFunc {
	return func(ctx context.Context, f *filterBuilder) {
		if isMissing != nil && *isMissing != "" {
			switch *isMissing {
			case "url":
				audiosURLsTableMgr.join(f, "", "audios.id")
				f.addWhere("audio_urls.url IS NULL")
			case "studio":
				f.addWhere("audios.studio_id IS NULL")
			case "performers":
				audioRepository.performers.join(f, "performers_join", "audios.id")
				f.addWhere("performers_join.audio_id IS NULL")
			case "date":
				f.addWhere(`audios.date IS NULL OR audios.date IS ""`)
			case "tags":
				audioRepository.tags.join(f, "tags_join", "audios.id")
				f.addWhere("tags_join.audio_id IS NULL")
			case "cover_image":
				f.addWhere("audios.cover_blob IS NULL")
			default:
				if err := validateIsMissing(*isMissing, []string{
					"title", "details", "rating",
				}); err != nil {
					f.setError(err)
					return
				}
				f.addWhere("(audios." + *isMissing + " IS NULL OR TRIM(audios." + *isMissing + ") = '')")
			}
		}
	}
}

func (qb *audioFilterHandler) urlsCriterionHandler(url *models.StringCriterionInput) criterionHandlerFunc {
	h := stringListCriterionHandlerBuilder{
		primaryTable: audioTable,
		primaryFK:    audioIDColumn,
		joinTable:    audioURLsTable,
		stringColumn: audioURLColumn,
		addJoinTable: func(f *filterBuilder) {
			audiosURLsTableMgr.join(f, "", "audios.id")
		},
	}
	return h.handler(url)
}

func (qb *audioFilterHandler) tagsCriterionHandler(tags *models.HierarchicalMultiCriterionInput) criterionHandlerFunc {
	h := joinedHierarchicalMultiCriterionHandlerBuilder{
		primaryTable: audioTable,
		foreignTable: tagTable,
		foreignFK:    "tag_id",

		relationsTable: "tags_relations",
		joinAs:         "audio_tag",
		joinTable:      audiosTagsTable,
		primaryFK:      audioIDColumn,
	}
	return h.handler(tags)
}

func (qb *audioFilterHandler) tagCountCriterionHandler(tagCount *models.IntCriterionInput) criterionHandlerFunc {
	h := countCriterionHandlerBuilder{
		primaryTable: audioTable,
		joinTable:    audiosTagsTable,
		primaryFK:    audioIDColumn,
	}
	return h.handler(tagCount)
}

func (qb *audioFilterHandler) performersCriterionHandler(performers *models.MultiCriterionInput) criterionHandlerFunc {
	h := joinedMultiCriterionHandlerBuilder{
		primaryTable: audioTable,
		joinTable:    performersAudiosTable,
		joinAs:       "performers_join",
		primaryFK:    audioIDColumn,
		foreignFK:    performerIDColumn,

		addJoinTable: func(f *filterBuilder) {
			audioRepository.performers.join(f, "performers_join", "audios.id")
		},
	}
	return h.handler(performers)
}

func (qb *audioFilterHandler) performerCountCriterionHandler(performerCount *models.IntCriterionInput) criterionHandlerFunc {
	h := countCriterionHandlerBuilder{
		primaryTable: audioTable,
		joinTable:    performersAudiosTable,
		primaryFK:    audioIDColumn,
	}
	return h.handler(performerCount)
}

func (qb *audioFilterHandler) performerTagsCriterionHandler(tags *models.HierarchicalMultiCriterionInput) criterionHandler {
	return &joinedPerformerTagsHandler{
		criterion:      tags,
		primaryTable:   audioTable,
		joinTable:      performersAudiosTable,
		joinPrimaryKey: audioIDColumn,
	}
}

func (qb *audioFilterHandler) performerFavoriteCriterionHandler(performerFavorite *bool) criterionHandlerFunc {
	return func(ctx context.Context, f *filterBuilder) {
		if performerFavorite != nil {
			f.addLeftJoin(performersAudiosTable, "", "audios.id = performers_audios.audio_id")

			if *performerFavorite {
				f.addLeftJoin("performers", "", "performers.id = performers_audios.performer_id")
				f.addWhere("performers.favorite = 1")
			} else {
				f.addLeftJoin(`(SELECT performers_audios.audio_id as id FROM performers_audios
JOIN performers ON performers.id = performers_audios.performer_id
GROUP BY performers_audios.audio_id HAVING SUM(performers.favorite) = 0)`, "nofaves", "audios.id = nofaves.id")
				f.addWhere("performers_audios.audio_id IS NULL OR nofaves.id IS NOT NULL")
			}
		}
	}
}
