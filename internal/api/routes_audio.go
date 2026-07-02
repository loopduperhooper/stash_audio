package api

import (
	"context"
	"errors"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/stashapp/stash_audio/internal/static"
	"github.com/stashapp/stash_audio/pkg/file"
	"github.com/stashapp/stash_audio/pkg/logger"
	"github.com/stashapp/stash_audio/pkg/models"
	"github.com/stashapp/stash_audio/pkg/txn"
	"github.com/stashapp/stash_audio/pkg/utils"
)

type AudioFinder interface {
	models.AudioGetter
	FindByChecksum(ctx context.Context, checksum string) ([]*models.Audio, error)
	GetCover(ctx context.Context, audioID int) ([]byte, error)
}

type audioRoutes struct {
	routes
	audioFinder AudioFinder
	fileGetter  models.FileGetter
}

func (rs audioRoutes) Routes() chi.Router {
	r := chi.NewRouter()

	r.Route("/{audioId}", func(r chi.Router) {
		r.Use(rs.AudioCtx)

		r.Get("/stream", rs.Stream)
		r.Get("/cover", rs.Cover)
		r.Get("/vtt/chapter", rs.VttChapter)
		r.Get("/funscript", rs.Funscript)
		r.Get("/subtitles", rs.Subtitles)
	})

	return r
}

func (rs audioRoutes) Stream(w http.ResponseWriter, r *http.Request) {
	audio := r.Context().Value(audioKey).(*models.Audio)

	if audio.Path == "" {
		http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
		return
	}

	f := audio.Files.Primary()
	if f == nil {
		http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
		return
	}

	if err := f.Base().Serve(&file.OsFS{}, w, r); err != nil {
		if !errors.Is(err, context.Canceled) {
			logger.Errorf("error serving audio %d: %v", audio.ID, err)
		}
	}
}

func (rs audioRoutes) Cover(w http.ResponseWriter, r *http.Request) {
	if r.URL.Query().Get("default") == "true" {
		utils.ServeImage(w, r, static.ReadAll(static.DefaultAudioImage))
		return
	}

	audio := r.Context().Value(audioKey).(*models.Audio)

	var cover []byte
	readTxnErr := txn.WithReadTxn(r.Context(), rs.txnManager, func(ctx context.Context) error {
		var err error
		cover, err = rs.audioFinder.GetCover(ctx, audio.ID)
		return err
	})
	if errors.Is(readTxnErr, context.Canceled) {
		return
	}
	if readTxnErr != nil {
		logger.Warnf("read transaction error fetching audio cover: %v", readTxnErr)
	}

	if cover == nil {
		cover = static.ReadAll(static.DefaultAudioImage)
	}

	utils.ServeImage(w, r, cover)
}

func (rs audioRoutes) Funscript(w http.ResponseWriter, r *http.Request) {
	audio := r.Context().Value(audioKey).(*models.Audio)
	f := audio.Files.Primary()
	if f == nil {
		http.NotFound(w, r)
		return
	}

	path := f.Base().Path
	ext := filepath.Ext(path)
	sidecar := path[:len(path)-len(ext)] + ".funscript"

	http.ServeFile(w, r, sidecar)
}

func (rs audioRoutes) Subtitles(w http.ResponseWriter, r *http.Request) {
	audio := r.Context().Value(audioKey).(*models.Audio)
	f := audio.Files.Primary()
	if f == nil {
		http.NotFound(w, r)
		return
	}

	base := strings.TrimSuffix(f.Base().Path, filepath.Ext(f.Base().Path))
	for _, ext := range []string{".vtt", ".srt"} {
		candidate := base + ext
		if _, err := os.Stat(candidate); err == nil {
			w.Header().Set("Cache-Control", "no-cache")
			http.ServeFile(w, r, candidate)
			return
		}
	}
	http.NotFound(w, r)
}

// VttChapter returns an empty WebVTT file for now.
// Full implementation is deferred until audio markers are implemented.
func (rs audioRoutes) VttChapter(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/vtt")
	vttLines := []string{"WEBVTT", ""}
	if _, err := w.Write([]byte(strings.Join(vttLines, "\n"))); err != nil {
		logger.Warnf("error writing audio VTT response: %v", err)
	}
}

func (rs audioRoutes) AudioCtx(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		audioIdentifier := chi.URLParam(r, "audioId")
		audioID, _ := strconv.Atoi(audioIdentifier)

		var audio *models.Audio
		_ = rs.withReadTxn(r, func(ctx context.Context) error {
			qb := rs.audioFinder
			var err error
			if audioID == 0 {
				audios, _ := qb.FindByChecksum(ctx, audioIdentifier)
				if len(audios) > 0 {
					audio = audios[0]
				}
			} else {
				audio, err = qb.Find(ctx, audioID)
			}

			if audio != nil {
				if err = audio.LoadPrimaryFile(ctx, rs.fileGetter); err != nil {
					if !errors.Is(err, context.Canceled) {
						logger.Errorf("error loading primary file for audio %d: %v", audioID, err)
					}
					audio = nil
				}
			}

			return err
		})

		if audio == nil {
			http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
			return
		}

		ctx := context.WithValue(r.Context(), audioKey, audio)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
