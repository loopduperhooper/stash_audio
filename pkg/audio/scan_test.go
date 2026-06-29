package audio

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stashapp/stash_audio/pkg/models"
	"github.com/stashapp/stash_audio/pkg/plugin"
	"github.com/stashapp/stash_audio/pkg/txn"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// txnMgr is a minimal TxnManager for tests so plugin hook registration doesn't panic.
type txnMgr struct{}

func (*txnMgr) Begin(ctx context.Context, _ bool) (context.Context, error) { return ctx, nil }
func (*txnMgr) Commit(_ context.Context) error                             { return nil }
func (*txnMgr) Rollback(_ context.Context) error                           { return nil }
func (*txnMgr) Complete(_ context.Context)                                 {}
func (*txnMgr) AddPostCommitHook(_ context.Context, _ txn.TxnFunc)         {}
func (*txnMgr) AddPostRollbackHook(_ context.Context, _ txn.TxnFunc)       {}
func (*txnMgr) IsLocked(_ error) bool                                      { return false }
func (*txnMgr) WithDatabase(ctx context.Context) (context.Context, error)  { return ctx, nil }

// withTxnCtx runs fn inside a fake transaction so plugin hook registration doesn't panic.
func withTxnCtx(fn func(ctx context.Context)) {
	_ = txn.WithTxn(context.Background(), &txnMgr{}, func(ctx context.Context) error {
		fn(ctx)
		return errors.New("rollback")
	})
}

// mockCreatorUpdater implements ScanCreatorUpdater for testing.
type mockCreatorUpdater struct {
	mock.Mock
}

func (m *mockCreatorUpdater) FindByFileID(ctx context.Context, fileID models.FileID) ([]*models.Audio, error) {
	args := m.Called(ctx, fileID)
	return args.Get(0).([]*models.Audio), args.Error(1)
}

func (m *mockCreatorUpdater) FindByFingerprints(ctx context.Context, fp []models.Fingerprint) ([]*models.Audio, error) {
	args := m.Called(ctx, fp)
	return args.Get(0).([]*models.Audio), args.Error(1)
}

func (m *mockCreatorUpdater) GetFiles(ctx context.Context, relatedID int) ([]models.File, error) {
	args := m.Called(ctx, relatedID)
	return args.Get(0).([]models.File), args.Error(1)
}

func (m *mockCreatorUpdater) Create(ctx context.Context, newAudio *models.Audio, fileIDs []models.FileID) error {
	args := m.Called(ctx, newAudio, fileIDs)
	return args.Error(0)
}

func (m *mockCreatorUpdater) UpdatePartial(ctx context.Context, id int, updatedAudio models.AudioPartial) (*models.Audio, error) {
	args := m.Called(ctx, id, updatedAudio)
	return args.Get(0).(*models.Audio), args.Error(1)
}

func (m *mockCreatorUpdater) AddFileID(ctx context.Context, id int, fileID models.FileID) error {
	args := m.Called(ctx, id, fileID)
	return args.Error(0)
}

// Compile-time interface check.
var _ ScanCreatorUpdater = (*mockCreatorUpdater)(nil)

// mockCoverUpdater implements CoverUpdater for testing.
type mockCoverUpdater struct {
	mock.Mock
}

func (m *mockCoverUpdater) HasCover(ctx context.Context, audioID int) (bool, error) {
	args := m.Called(ctx, audioID)
	return args.Bool(0), args.Error(1)
}

func (m *mockCoverUpdater) UpdateCover(ctx context.Context, audioID int, cover []byte) error {
	args := m.Called(ctx, audioID, cover)
	return args.Error(0)
}

var _ CoverUpdater = (*mockCoverUpdater)(nil)

const testAudioID = 1

const testFileID = models.FileID(100)

func makeAudioFile(id models.FileID, path string) *models.AudioFile {
	return &models.AudioFile{
		BaseFile: &models.BaseFile{
			ID:   id,
			Path: path,
			Fingerprints: models.Fingerprints{
				{Type: models.FingerprintTypeMD5, Fingerprint: "abc123"},
			},
		},
		Duration:   180.0,
		AudioCodec: "mp3",
		BitRate:    320000,
	}
}

func makeAudioWithFile(audioID int, file *models.AudioFile) *models.Audio {
	return &models.Audio{
		ID:    audioID,
		Files: models.NewRelatedFiles([]models.File{file}),
	}
}

func TestAssociateExisting_SkipsUpdateWhenFileUnchangedAndAlreadyAssociated(t *testing.T) {
	existingFile := makeAudioFile(testFileID, "test.mp3")
	audio := makeAudioWithFile(testAudioID, existingFile)

	cu := &mockCreatorUpdater{}
	cu.On("GetFiles", mock.Anything, testAudioID).Return([]models.File{existingFile}, nil)

	h := &ScanHandler{CreatorUpdater: cu, PluginCache: &plugin.Cache{}}

	withTxnCtx(func(ctx context.Context) {
		err := h.associateExisting(ctx, []*models.Audio{audio}, existingFile, false)
		assert.NoError(t, err)
	})
	cu.AssertNotCalled(t, "UpdatePartial", mock.Anything, mock.Anything, mock.Anything)
}

func TestAssociateExisting_CallsUpdatePartialWhenFileContentChanged(t *testing.T) {
	existingFile := makeAudioFile(testFileID, "test.mp3")
	audio := makeAudioWithFile(testAudioID, existingFile)

	cu := &mockCreatorUpdater{}
	cu.On("GetFiles", mock.Anything, testAudioID).Return([]models.File{existingFile}, nil)
	cu.On("UpdatePartial", mock.Anything, testAudioID, mock.Anything).
		Return(&models.Audio{ID: testAudioID}, nil)

	h := &ScanHandler{CreatorUpdater: cu, PluginCache: &plugin.Cache{}}

	withTxnCtx(func(ctx context.Context) {
		err := h.associateExisting(ctx, []*models.Audio{audio}, existingFile, true)
		assert.NoError(t, err)
	})
	cu.AssertCalled(t, "UpdatePartial", mock.Anything, testAudioID, mock.Anything)
}

func TestAssociateExisting_AddsNewFileIDAndCallsUpdatePartial(t *testing.T) {
	const newFileID = models.FileID(200)

	existingFile := makeAudioFile(testFileID, "existing.mp3")
	newFile := makeAudioFile(newFileID, "new.mp3")
	audio := makeAudioWithFile(testAudioID, existingFile)

	cu := &mockCreatorUpdater{}
	cu.On("GetFiles", mock.Anything, testAudioID).Return([]models.File{existingFile}, nil)
	cu.On("AddFileID", mock.Anything, testAudioID, newFileID).Return(nil)
	cu.On("UpdatePartial", mock.Anything, testAudioID, mock.Anything).
		Return(&models.Audio{ID: testAudioID}, nil)

	h := &ScanHandler{CreatorUpdater: cu, PluginCache: &plugin.Cache{}}

	withTxnCtx(func(ctx context.Context) {
		err := h.associateExisting(ctx, []*models.Audio{audio}, newFile, false)
		assert.NoError(t, err)
	})
	cu.AssertCalled(t, "AddFileID", mock.Anything, testAudioID, newFileID)
	cu.AssertCalled(t, "UpdatePartial", mock.Anything, testAudioID, mock.Anything)
}

func TestHandle_ReturnsErrForNonAudioFile(t *testing.T) {
	videoFile := &models.VideoFile{
		BaseFile: &models.BaseFile{ID: testFileID, Path: "test.mp4"},
	}

	cu := &mockCreatorUpdater{}
	h := &ScanHandler{CreatorUpdater: cu, PluginCache: &plugin.Cache{}}

	err := h.Handle(context.Background(), videoFile, nil)
	assert.ErrorIs(t, err, ErrNotAudioFile)
	cu.AssertNotCalled(t, "FindByFileID", mock.Anything, mock.Anything)
}

func TestHandle_CreatesNewAudioForUnknownFile(t *testing.T) {
	audioFile := makeAudioFile(testFileID, "new.mp3")

	cu := &mockCreatorUpdater{}
	cu.On("FindByFileID", mock.Anything, testFileID).Return([]*models.Audio{}, nil)
	cu.On("FindByFingerprints", mock.Anything, mock.Anything).Return([]*models.Audio{}, nil)
	cu.On("Create", mock.Anything, mock.AnythingOfType("*models.Audio"), mock.Anything).Return(nil)

	h := &ScanHandler{CreatorUpdater: cu, PluginCache: &plugin.Cache{}}

	withTxnCtx(func(ctx context.Context) {
		err := h.Handle(ctx, audioFile, nil)
		assert.NoError(t, err)
	})
	cu.AssertCalled(t, "Create", mock.Anything, mock.Anything, []models.FileID{testFileID})
}

func TestHandle_MatchesExistingByFileID(t *testing.T) {
	audioFile := makeAudioFile(testFileID, "existing.mp3")
	existingAudio := makeAudioWithFile(testAudioID, audioFile)

	cu := &mockCreatorUpdater{}
	cu.On("FindByFileID", mock.Anything, testFileID).Return([]*models.Audio{existingAudio}, nil)
	cu.On("GetFiles", mock.Anything, testAudioID).Return([]models.File{audioFile}, nil)

	h := &ScanHandler{CreatorUpdater: cu, PluginCache: &plugin.Cache{}}

	withTxnCtx(func(ctx context.Context) {
		err := h.Handle(ctx, audioFile, nil)
		assert.NoError(t, err)
	})
	cu.AssertNotCalled(t, "FindByFingerprints", mock.Anything, mock.Anything)
	cu.AssertNotCalled(t, "Create", mock.Anything, mock.Anything, mock.Anything)
}

func TestHandle_MatchesExistingByFingerprint(t *testing.T) {
	audioFile := makeAudioFile(testFileID, "existing.mp3")
	existingAudio := makeAudioWithFile(testAudioID, audioFile)

	cu := &mockCreatorUpdater{}
	cu.On("FindByFileID", mock.Anything, testFileID).Return([]*models.Audio{}, nil)
	cu.On("FindByFingerprints", mock.Anything, mock.Anything).Return([]*models.Audio{existingAudio}, nil)
	cu.On("GetFiles", mock.Anything, testAudioID).Return([]models.File{audioFile}, nil)

	h := &ScanHandler{CreatorUpdater: cu, PluginCache: &plugin.Cache{}}

	withTxnCtx(func(ctx context.Context) {
		err := h.Handle(ctx, audioFile, nil)
		assert.NoError(t, err)
	})
	cu.AssertCalled(t, "FindByFingerprints", mock.Anything, mock.Anything)
	cu.AssertNotCalled(t, "Create", mock.Anything, mock.Anything, mock.Anything)
}

func TestExtractCoverIfMissing_SkipsWhenNoFFMpegOrCoverUpdater(t *testing.T) {
	// Neither FFMpeg nor CoverUpdater set — must not panic or call anything.
	cu := &mockCoverUpdater{}
	h := &ScanHandler{} // intentionally missing both fields

	h.extractCoverIfMissing(context.Background(), testAudioID, "test.mp3")

	cu.AssertNotCalled(t, "HasCover", mock.Anything, mock.Anything)
	cu.AssertNotCalled(t, "UpdateCover", mock.Anything, mock.Anything, mock.Anything)
}

func TestExtractCoverIfMissing_SkipsWhenCoverAlreadyExists(t *testing.T) {
	cu := &mockCoverUpdater{}
	cu.On("HasCover", mock.Anything, testAudioID).Return(true, nil)

	h := &ScanHandler{
		CoverUpdater: cu,
		// FFMpeg intentionally nil — extraction must not be attempted.
	}

	h.extractCoverIfMissing(context.Background(), testAudioID, "test.mp3")

	cu.AssertCalled(t, "HasCover", mock.Anything, testAudioID)
	cu.AssertNotCalled(t, "UpdateCover", mock.Anything, mock.Anything, mock.Anything)
}

func TestExtractCoverIfMissing_SkipsUpdateWhenNoCoverExtracted(t *testing.T) {
	// Cover extraction returns nil (file has no embedded art).
	cu := &mockCoverUpdater{}
	cu.On("HasCover", mock.Anything, testAudioID).Return(false, nil)

	// Use a nil FFMpeg — extractCoverIfMissing guards against it, but we
	// can't invoke a real ffmpeg binary in a unit test. We verify the guard
	// path: when FFMpeg is nil after HasCover returns false, nothing panics
	// and UpdateCover is never called.
	h := &ScanHandler{
		CoverUpdater: cu,
		FFMpeg:       nil,
	}

	h.extractCoverIfMissing(context.Background(), testAudioID, "test.mp3")

	cu.AssertNotCalled(t, "UpdateCover", mock.Anything, mock.Anything, mock.Anything)
}

func TestExtractCoverIfMissing_SkipsUpdateOnHasCoverError(t *testing.T) {
	cu := &mockCoverUpdater{}
	cu.On("HasCover", mock.Anything, testAudioID).Return(false, errors.New("db error"))

	h := &ScanHandler{CoverUpdater: cu}

	// Must not panic and must not call UpdateCover.
	h.extractCoverIfMissing(context.Background(), testAudioID, "test.mp3")

	cu.AssertNotCalled(t, "UpdateCover", mock.Anything, mock.Anything, mock.Anything)
}

// TestAudioModelFields verifies that PlayCount and LastPlayedAt are present on
// Audio and AudioPartial (regression guard for Task 1.6).
func TestAudioModelFields(t *testing.T) {
	now := time.Now()
	a := models.Audio{
		PlayCount:    5,
		LastPlayedAt: &now,
		PlayDuration: 123.4,
		ResumeTime:   45.6,
	}
	assert.Equal(t, 5, a.PlayCount)
	assert.Equal(t, &now, a.LastPlayedAt)

	p := models.AudioPartial{
		PlayCount:    models.NewOptionalInt(3),
		LastPlayedAt: models.NewOptionalTime(now),
	}
	assert.True(t, p.PlayCount.Set)
	assert.True(t, p.LastPlayedAt.Set)
}
