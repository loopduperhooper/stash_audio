package audio

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"github.com/stashapp/stash/pkg/ffmpeg"
	"github.com/stashapp/stash/pkg/file"
	"github.com/stashapp/stash/pkg/models"
)

// Decorator adds audio-specific fields to a File.
type Decorator struct {
	FFProbe *ffmpeg.FFProbe
}

func (d *Decorator) Decorate(ctx context.Context, fs models.FS, f models.File) (models.File, error) {
	if d.FFProbe == nil {
		return f, errors.New("ffprobe not configured")
	}

	base := f.Base()
	if _, isOs := fs.(*file.OsFS); !isOs {
		return f, fmt.Errorf("audio.Decorate: only OsFS is supported")
	}

	probe := d.FFProbe
	videoFile, err := probe.NewVideoFile(base.Path)
	if err != nil {
		return f, fmt.Errorf("running ffprobe on %q: %w", base.Path, err)
	}

	container, err := ffmpeg.MatchContainer(videoFile.Container, base.Path)
	if err != nil {
		return f, fmt.Errorf("matching container for %q: %w", base.Path, err)
	}

	audioCodec := videoFile.AudioCodec
	var bitRate int64
	var sampleRate int
	var channels int

	if audioStream := videoFile.AudioStream; audioStream != nil {
		bitRate, _ = strconv.ParseInt(audioStream.BitRate, 10, 64)
		if bitRate == 0 {
			// fall back to overall bitrate
			bitRate = videoFile.Bitrate
		}
		sr, _ := strconv.ParseInt(audioStream.SampleRate, 10, 64)
		sampleRate = int(sr)
		channels = audioStream.Channels
	} else {
		bitRate = videoFile.Bitrate
	}

	return &models.AudioFile{
		BaseFile:   base,
		Format:     string(container),
		AudioCodec: audioCodec,
		Duration:   videoFile.FileDuration,
		BitRate:    bitRate,
		SampleRate: sampleRate,
		Channels:   channels,
	}, nil
}

func (d *Decorator) IsMissingMetadata(ctx context.Context, fs models.FS, f models.File) bool {
	const unsetString = "unset"

	af, ok := f.(*models.AudioFile)
	if !ok {
		return true
	}

	return af.AudioCodec == unsetString || af.Format == unsetString ||
		af.Duration < 0 || af.BitRate < 0
}
