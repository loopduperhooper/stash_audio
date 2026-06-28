package api

import (
	"context"

	"github.com/stashapp/stash_audio/internal/api/loaders"
	"github.com/stashapp/stash_audio/pkg/models"
)

func fingerprintResolver(fp models.Fingerprints, type_ string) (*string, error) {
	fingerprint := fp.For(type_)
	if fingerprint != nil {
		value := fingerprint.Value()
		return &value, nil
	}
	return nil, nil
}

func (r *basicFileResolver) Fingerprint(ctx context.Context, obj *BasicFile, type_ string) (*string, error) {
	return fingerprintResolver(obj.BaseFile.Fingerprints, type_)
}

func (r *basicFileResolver) ParentFolder(ctx context.Context, obj *BasicFile) (*models.Folder, error) {
	return loaders.From(ctx).FolderByID.Load(obj.ParentFolderID)
}

func zipFileResolver(ctx context.Context, zipFileID *models.FileID) (*BasicFile, error) {
	if zipFileID == nil {
		return nil, nil
	}

	f, err := loaders.From(ctx).FileByID.Load(*zipFileID)
	if err != nil {
		return nil, err
	}

	return &BasicFile{
		BaseFile: f.Base(),
	}, nil
}

func (r *basicFileResolver) ZipFile(ctx context.Context, obj *BasicFile) (*BasicFile, error) {
	return zipFileResolver(ctx, obj.ZipFileID)
}

func (r *audioFileResolver) Fingerprint(ctx context.Context, obj *AudioFile, typeArg string) (*string, error) {
	return fingerprintResolver(obj.AudioFile.Fingerprints, typeArg)
}

func (r *audioFileResolver) ParentFolder(ctx context.Context, obj *AudioFile) (*models.Folder, error) {
	return loaders.From(ctx).FolderByID.Load(obj.ParentFolderID)
}

func (r *audioFileResolver) ZipFile(ctx context.Context, obj *AudioFile) (*BasicFile, error) {
	return zipFileResolver(ctx, obj.ZipFileID)
}
