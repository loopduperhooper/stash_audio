package models

import "context"

// AudioFilterType represents criteria for filtering audio objects.
type AudioFilterType struct {
	OperatorFilter[AudioFilterType]
	ID      *IntCriterionInput    `json:"id"`
	Title   *StringCriterionInput `json:"title"`
	Details *StringCriterionInput `json:"details"`
	// Filter by file checksum
	Checksum *StringCriterionInput `json:"checksum"`
	// Filter by path
	Path *StringCriterionInput `json:"path"`
	// Filter by file count
	FileCount *IntCriterionInput `json:"file_count"`
	// Filter by rating expressed as 1-100
	Rating100 *IntCriterionInput `json:"rating100"`
	// Filter by organized
	Organized *bool `json:"organized"`
	// Filter by o-counter
	OCounter *IntCriterionInput `json:"o_counter"`
	// Filter by bitrate
	Bitrate *IntCriterionInput `json:"bitrate"`
	// Filter by audio codec
	AudioCodec *StringCriterionInput `json:"audio_codec"`
	// Filter by duration (in seconds)
	Duration *IntCriterionInput `json:"duration"`
	// Filter to only include audios which have markers. `true` or `false`
	HasMarkers *string `json:"has_markers"`
	// Filter to only include audios missing this property
	IsMissing *string `json:"is_missing"`
	// Filter to only include audios with this studio
	Studios *HierarchicalMultiCriterionInput `json:"studios"`
	// Filter to only include audios with these tags
	Tags *HierarchicalMultiCriterionInput `json:"tags"`
	// Filter by tag count
	TagCount *IntCriterionInput `json:"tag_count"`
	// Filter to only include audios with performers with these tags
	PerformerTags *HierarchicalMultiCriterionInput `json:"performer_tags"`
	// Filter audios that have performers that have been favorited
	PerformerFavorite *bool `json:"performer_favorite"`
	// Filter to only include audios with these performers
	Performers *MultiCriterionInput `json:"performers"`
	// Filter by performer count
	PerformerCount *IntCriterionInput `json:"performer_count"`
	// Filter by StashID
	StashID *StringCriterionInput `json:"stash_id"`
	// Filter by StashID Endpoint
	StashIDEndpoint *StashIDCriterionInput `json:"stash_id_endpoint"`
	// Filter by url
	URL *StringCriterionInput `json:"url"`
	// Filter by resume time
	ResumeTime *IntCriterionInput `json:"resume_time"`
	// Filter by play count
	PlayCount *IntCriterionInput `json:"play_count"`
	// Filter by play duration (in seconds)
	PlayDuration *IntCriterionInput `json:"play_duration"`
	// Filter by last played at
	LastPlayedAt *TimestampCriterionInput `json:"last_played_at"`
	// Filter by date
	Date *DateCriterionInput `json:"date"`
	// Filter by related performers that meet this criteria
	PerformersFilter *PerformerFilterType `json:"performers_filter"`
	// Filter by related studios that meet this criteria
	StudiosFilter *StudioFilterType `json:"studios_filter"`
	// Filter by related tags that meet this criteria
	TagsFilter *TagFilterType `json:"tags_filter"`
	// Filter by related files that meet this criteria
	FilesFilter *FileFilterType `json:"files_filter"`
	// Filter by created at
	CreatedAt *TimestampCriterionInput `json:"created_at"`
	// Filter by updated at
	UpdatedAt *TimestampCriterionInput `json:"updated_at"`
}

type AudioQueryOptions struct {
	QueryOptions
	AudioFilter *AudioFilterType

	TotalDuration bool
	TotalSize     bool
}

type AudioQueryResult struct {
	QueryResult[int]
	TotalDuration float64
	TotalSize     float64

	getter AudioGetter
	audios []*Audio
}

func NewAudioQueryResult(getter AudioGetter) *AudioQueryResult {
	return &AudioQueryResult{
		getter: getter,
	}
}

func (r *AudioQueryResult) Resolve(ctx context.Context) ([]*Audio, error) {
	// Lazily resolve IDs into Audio objects
	if r.audios != nil {
		return r.audios, nil
	}

	var err error
	r.audios, err = r.getter.FindMany(ctx, r.IDs)
	return r.audios, err
}
