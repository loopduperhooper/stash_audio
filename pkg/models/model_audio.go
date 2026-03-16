package models

import (
	"context"
	"path/filepath"
	"strconv"
	"time"
)

// Audio stores the metadata for a single audio file.
type Audio struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Details string `json:"details"`
	Date    *Date  `json:"date"`
	// Rating expressed in 1-100 scale
	Rating    *int `json:"rating"`
	OCounter  int  `json:"o_counter"`
	Organized bool `json:"organized"`
	StudioID  *int `json:"studio_id"`

	// transient - not persisted
	Files         RelatedFiles
	PrimaryFileID *FileID
	// transient - path of primary file - empty if no files
	Path string
	// transient - checksum of primary file - empty if no files
	Checksum string

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	ResumeTime   float64    `json:"resume_time"`
	PlayDuration float64    `json:"play_duration"`
	PlayCount    int        `json:"play_count"`
	LastPlayedAt *time.Time `json:"last_played_at"`

	URLs         RelatedStrings  `json:"urls"`
	TagIDs       RelatedIDs      `json:"tag_ids"`
	PerformerIDs RelatedIDs      `json:"performer_ids"`
	StashIDs     RelatedStashIDs `json:"stash_ids"`
}

func NewAudio() Audio {
	currentTime := time.Now()
	return Audio{
		CreatedAt: currentTime,
		UpdatedAt: currentTime,
	}
}

type CreateAudioInput struct {
	*Audio

	FileIDs    []FileID
	CoverImage []byte
}

type UpdateAudioInput struct {
	*Audio
}

// AudioPartial represents part of an Audio object. It is used to update
// the database entry.
type AudioPartial struct {
	Title   OptionalString
	Details OptionalString
	Date    OptionalDate
	// Rating expressed in 1-100 scale
	Rating       OptionalInt
	OCounter     OptionalInt
	Organized    OptionalBool
	StudioID     OptionalInt
	CreatedAt    OptionalTime
	UpdatedAt    OptionalTime
	ResumeTime   OptionalFloat64
	PlayDuration OptionalFloat64
	PlayCount    OptionalInt
	LastPlayedAt OptionalTime

	URLs          *UpdateStrings
	TagIDs        *UpdateIDs
	PerformerIDs  *UpdateIDs
	StashIDs      *UpdateStashIDs
	PrimaryFileID *FileID
}

func NewAudioPartial() AudioPartial {
	currentTime := time.Now()
	return AudioPartial{
		UpdatedAt: NewOptionalTime(currentTime),
	}
}

func (a *Audio) LoadURLs(ctx context.Context, l URLLoader) error {
	return a.URLs.load(func() ([]string, error) {
		return l.GetURLs(ctx, a.ID)
	})
}

func (a *Audio) LoadFiles(ctx context.Context, l FileLoader) error {
	return a.Files.load(func() ([]File, error) {
		return l.GetFiles(ctx, a.ID)
	})
}

func (a *Audio) LoadPrimaryFile(ctx context.Context, l FileGetter) error {
	return a.Files.loadPrimary(func() (File, error) {
		if a.PrimaryFileID == nil {
			return nil, nil
		}

		f, err := l.Find(ctx, *a.PrimaryFileID)
		if err != nil {
			return nil, err
		}

		if len(f) > 0 {
			return f[0], nil
		}
		return nil, nil
	})
}

func (a *Audio) LoadPerformerIDs(ctx context.Context, l PerformerIDLoader) error {
	return a.PerformerIDs.load(func() ([]int, error) {
		return l.GetPerformerIDs(ctx, a.ID)
	})
}

func (a *Audio) LoadTagIDs(ctx context.Context, l TagIDLoader) error {
	return a.TagIDs.load(func() ([]int, error) {
		return l.GetTagIDs(ctx, a.ID)
	})
}

func (a *Audio) LoadStashIDs(ctx context.Context, l StashIDLoader) error {
	return a.StashIDs.load(func() ([]StashID, error) {
		return l.GetStashIDs(ctx, a.ID)
	})
}

func (a *Audio) LoadRelationships(ctx context.Context, l AudioReader) error {
	if err := a.LoadURLs(ctx, l); err != nil {
		return err
	}

	if err := a.LoadPerformerIDs(ctx, l); err != nil {
		return err
	}

	if err := a.LoadTagIDs(ctx, l); err != nil {
		return err
	}

	if err := a.LoadStashIDs(ctx, l); err != nil {
		return err
	}

	if err := a.LoadFiles(ctx, l); err != nil {
		return err
	}

	return nil
}

// GetTitle returns the title of the audio. If the Title field is empty,
// then the base filename is returned.
func (a Audio) GetTitle() string {
	if a.Title != "" {
		return a.Title
	}

	return filepath.Base(a.Path)
}

// DisplayName returns a display name for the audio for logging purposes.
func (a Audio) DisplayName() string {
	if a.Path != "" {
		return a.Path
	}

	return strconv.Itoa(a.ID)
}
