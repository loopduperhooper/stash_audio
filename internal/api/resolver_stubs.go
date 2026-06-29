package api

// resolver_stubs.go — stub implementations for resolver methods that have no
// real backing logic (scraper, DLNA, old scene/image/gallery filter hooks).
// gqlgen requires all interface methods to be implemented; these satisfy that
// requirement while returning ErrNotImplemented or no-op for audio-only paths.

import (
	"context"

	"github.com/stashapp/stash_audio/internal/manager"
	"github.com/stashapp/stash_audio/internal/manager/task"
	"github.com/stashapp/stash_audio/pkg/models"
)

// ---------------------------------------------------------------------------
// ResolverRoot — additional sub-resolver factories
// ---------------------------------------------------------------------------

func (r *Resolver) GalleryFile() GalleryFileResolver       { return &galleryFileResolver{r} }
func (r *Resolver) ImageFile() ImageFileResolver           { return &imageFileResolver{r} }
func (r *Resolver) VideoFile() VideoFileResolver           { return &videoFileResolver{r} }
func (r *Resolver) CleanGeneratedInput() CleanGeneratedInputResolver {
	return &cleanGeneratedInputResolver{r}
}
func (r *Resolver) ExportObjectsInput() ExportObjectsInputResolver {
	return &exportObjectsInputResolver{r}
}
func (r *Resolver) FileFilterType() FileFilterTypeResolver { return &fileFilterTypeResolver{r} }

// ---------------------------------------------------------------------------
// AudioCount — entity resolver methods
// ---------------------------------------------------------------------------

func (r *performerResolver) AudioCount(ctx context.Context, obj *models.Performer) (int, error) {
	var ret int
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		var err error
		ret, err = r.repository.Audio.CountByPerformerID(ctx, obj.ID)
		return err
	}); err != nil {
		return 0, err
	}
	return ret, nil
}

func (r *studioResolver) AudioCount(ctx context.Context, obj *models.Studio, depth *int) (int, error) {
	return 0, nil
}

func (r *groupResolver) AudioCount(ctx context.Context, obj *models.Group, depth *int) (int, error) {
	return 0, nil
}

func (r *tagResolver) AudioCount(ctx context.Context, obj *models.Tag, depth *int) (int, error) {
	return 0, nil
}

// ---------------------------------------------------------------------------
// mutationResolver — stub mutations (DLNA, scraper, stash-box, identify)
// ---------------------------------------------------------------------------

func (r *mutationResolver) MetadataGenerate(ctx context.Context, input GenerateMetadataInput) (string, error) {
	return "", ErrNotImplemented
}

func (r *mutationResolver) MetadataIdentify(ctx context.Context, input IdentifyMetadataInput) (string, error) {
	return "", ErrNotImplemented
}

func (r *mutationResolver) SubmitStashBoxFingerprints(ctx context.Context, input StashBoxFingerprintSubmissionInput) (bool, error) {
	return false, ErrNotImplemented
}

func (r *mutationResolver) SubmitStashBoxPerformerDraft(ctx context.Context, input StashBoxDraftSubmissionInput) (*string, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) StashBoxBatchPerformerTag(ctx context.Context, input StashBoxBatchTagInput) (string, error) {
	return "", ErrNotImplemented
}

func (r *mutationResolver) StashBoxBatchStudioTag(ctx context.Context, input StashBoxBatchTagInput) (string, error) {
	return "", ErrNotImplemented
}

func (r *mutationResolver) StashBoxBatchTagTag(ctx context.Context, input StashBoxBatchTagInput) (string, error) {
	return "", ErrNotImplemented
}

func (r *mutationResolver) EnableDlna(ctx context.Context, input EnableDLNAInput) (bool, error) {
	return false, ErrNotImplemented
}

func (r *mutationResolver) DisableDlna(ctx context.Context, input DisableDLNAInput) (bool, error) {
	return false, ErrNotImplemented
}

func (r *mutationResolver) AddTempDlnaip(ctx context.Context, input AddTempDLNAIPInput) (bool, error) {
	return false, ErrNotImplemented
}

func (r *mutationResolver) RemoveTempDlnaip(ctx context.Context, input RemoveTempDLNAIPInput) (bool, error) {
	return false, ErrNotImplemented
}

// ---------------------------------------------------------------------------
// queryResolver — stub queries (scraper, DLNA)
// ---------------------------------------------------------------------------

func (r *queryResolver) ListScrapers(ctx context.Context, types []ScrapeContentType) ([]*Scraper, error) {
	return nil, nil
}

func (r *queryResolver) ScrapeSingleStudio(ctx context.Context, source ScraperSourceInput, input ScrapeSingleStudioInput) ([]*ScrapedStudio, error) {
	return nil, ErrNotImplemented
}

func (r *queryResolver) ScrapeSingleTag(ctx context.Context, source ScraperSourceInput, input ScrapeSingleTagInput) ([]*ScrapedTag, error) {
	return nil, ErrNotImplemented
}

func (r *queryResolver) ScrapeSinglePerformer(ctx context.Context, source ScraperSourceInput, input ScrapeSinglePerformerInput) ([]*ScrapedPerformer, error) {
	return nil, ErrNotImplemented
}

func (r *queryResolver) ScrapeMultiPerformers(ctx context.Context, source ScraperSourceInput, input ScrapeMultiPerformersInput) ([][]*ScrapedPerformer, error) {
	return nil, ErrNotImplemented
}

func (r *queryResolver) ScrapeSingleMovie(ctx context.Context, source ScraperSourceInput, input ScrapeSingleMovieInput) ([]*ScrapedMovie, error) {
	return nil, ErrNotImplemented
}

func (r *queryResolver) ScrapeSingleGroup(ctx context.Context, source ScraperSourceInput, input ScrapeSingleGroupInput) ([]*ScrapedGroup, error) {
	return nil, ErrNotImplemented
}

func (r *queryResolver) ScrapeURL(ctx context.Context, url string, ty ScrapeContentType) (ScrapedContent, error) {
	return nil, ErrNotImplemented
}

func (r *queryResolver) ScrapePerformerURL(ctx context.Context, url string) (*ScrapedPerformer, error) {
	return nil, ErrNotImplemented
}

func (r *queryResolver) ScrapeMovieURL(ctx context.Context, url string) (*ScrapedMovie, error) {
	return nil, ErrNotImplemented
}

func (r *queryResolver) ScrapeGroupURL(ctx context.Context, url string) (*ScrapedGroup, error) {
	return nil, ErrNotImplemented
}

func (r *queryResolver) DlnaStatus(ctx context.Context) (*DLNAStatus, error) {
	return &DLNAStatus{Running: false, RecentIPAddresses: []string{}, AllowedIPAddresses: []*Dlnaip{}}, nil
}

// ---------------------------------------------------------------------------
// GalleryFileResolver
// ---------------------------------------------------------------------------

type galleryFileResolver struct{ *Resolver }

func (r *galleryFileResolver) ParentFolder(ctx context.Context, obj *GalleryFile) (*models.Folder, error) {
	return nil, ErrNotImplemented
}
func (r *galleryFileResolver) ZipFile(ctx context.Context, obj *GalleryFile) (*BasicFile, error) {
	return nil, nil
}
func (r *galleryFileResolver) Fingerprint(ctx context.Context, obj *GalleryFile, typeArg string) (*string, error) {
	return nil, nil
}

// ---------------------------------------------------------------------------
// ImageFileResolver
// ---------------------------------------------------------------------------

type imageFileResolver struct{ *Resolver }

func (r *imageFileResolver) ParentFolder(ctx context.Context, obj *ImageFile) (*models.Folder, error) {
	return nil, ErrNotImplemented
}
func (r *imageFileResolver) ZipFile(ctx context.Context, obj *ImageFile) (*BasicFile, error) {
	return nil, nil
}
func (r *imageFileResolver) Fingerprint(ctx context.Context, obj *ImageFile, typeArg string) (*string, error) {
	return nil, nil
}

// ---------------------------------------------------------------------------
// VideoFileResolver
// ---------------------------------------------------------------------------

type videoFileResolver struct{ *Resolver }

func (r *videoFileResolver) ParentFolder(ctx context.Context, obj *VideoFile) (*models.Folder, error) {
	return nil, ErrNotImplemented
}
func (r *videoFileResolver) ZipFile(ctx context.Context, obj *VideoFile) (*BasicFile, error) {
	return nil, nil
}
func (r *videoFileResolver) Fingerprint(ctx context.Context, obj *VideoFile, typeArg string) (*string, error) {
	return nil, nil
}

// ---------------------------------------------------------------------------
// CleanGeneratedInputResolver — all fields are optional in the schema
// ---------------------------------------------------------------------------

type cleanGeneratedInputResolver struct{ *Resolver }

func (r *cleanGeneratedInputResolver) Sprites(ctx context.Context, obj *task.CleanGeneratedOptions, data *bool) error {
	return nil
}
func (r *cleanGeneratedInputResolver) Screenshots(ctx context.Context, obj *task.CleanGeneratedOptions, data *bool) error {
	return nil
}
func (r *cleanGeneratedInputResolver) Transcodes(ctx context.Context, obj *task.CleanGeneratedOptions, data *bool) error {
	return nil
}
func (r *cleanGeneratedInputResolver) Markers(ctx context.Context, obj *task.CleanGeneratedOptions, data *bool) error {
	return nil
}
func (r *cleanGeneratedInputResolver) ImageThumbnails(ctx context.Context, obj *task.CleanGeneratedOptions, data *bool) error {
	return nil
}

// ---------------------------------------------------------------------------
// ExportObjectsInputResolver — scene/image/gallery export not applicable
// ---------------------------------------------------------------------------

type exportObjectsInputResolver struct{ *Resolver }

func (r *exportObjectsInputResolver) Scenes(ctx context.Context, obj *manager.ExportObjectsInput, data *manager.ExportObjectTypeInput) error {
	return nil
}
func (r *exportObjectsInputResolver) Images(ctx context.Context, obj *manager.ExportObjectsInput, data *manager.ExportObjectTypeInput) error {
	return nil
}
func (r *exportObjectsInputResolver) Galleries(ctx context.Context, obj *manager.ExportObjectsInput, data *manager.ExportObjectTypeInput) error {
	return nil
}

// ---------------------------------------------------------------------------
// FileFilterTypeResolver — duplicated field not mapped in Go struct
// ---------------------------------------------------------------------------

type fileFilterTypeResolver struct{ *Resolver }

func (r *fileFilterTypeResolver) Duplicated(ctx context.Context, obj *models.FileFilterType, data *FileDuplicationCriterionInput) error {
	return nil
}
