package ffmpeg

import (
	"bytes"
	"context"

	stashExec "github.com/stashapp/stash_audio/pkg/exec"
)

// ExtractEmbeddedCover extracts the first attached picture stream from a media
// file (e.g. ID3 cover art in an MP3) and returns the raw image bytes.
// Returns nil, nil when no embedded cover is found.
func (f *FFMpeg) ExtractEmbeddedCover(ctx context.Context, filePath string) ([]byte, error) {
	// -map 0:v selects all video streams; for audio-only files this is the
	// attached picture. -c copy avoids re-encoding. -f image2 forces image
	// output format. pipe:1 writes to stdout.
	args := []string{
		"-hide_banner",
		"-loglevel", "error",
		"-i", filePath,
		"-map", "0:v",
		"-c", "copy",
		"-f", "image2",
		"pipe:1",
	}

	var stdout bytes.Buffer
	cmd := stashExec.CommandContext(ctx, f.ffmpeg, args...)
	cmd.Stdout = &stdout

	if err := cmd.Run(); err != nil {
		// ffmpeg exits non-zero when there is no video/picture stream — treat
		// as "no cover" rather than a hard error.
		return nil, nil
	}

	if stdout.Len() == 0 {
		return nil, nil
	}

	return stdout.Bytes(), nil
}
