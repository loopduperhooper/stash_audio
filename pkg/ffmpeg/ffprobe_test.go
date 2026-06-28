package ffmpeg

import "testing"

func makeStream(codecType string, attachedPic int) FFProbeStream {
	s := FFProbeStream{CodecType: codecType}
	s.Disposition.AttachedPic = attachedPic
	return s
}

func TestVideoFile_HasEmbeddedCover(t *testing.T) {
	tests := []struct {
		name    string
		streams []FFProbeStream
		want    bool
	}{
		{
			name:    "no streams",
			streams: nil,
			want:    false,
		},
		{
			name:    "audio stream only, no cover",
			streams: []FFProbeStream{makeStream("audio", 0)},
			want:    false,
		},
		{
			name:    "attached picture stream present",
			streams: []FFProbeStream{makeStream("audio", 0), makeStream("video", 1)},
			want:    true,
		},
		{
			name:    "video stream that is not an attached picture",
			streams: []FFProbeStream{makeStream("video", 0)},
			want:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			vf := &VideoFile{JSON: FFProbeJSON{Streams: tt.streams}}
			if got := vf.HasEmbeddedCover(); got != tt.want {
				t.Errorf("HasEmbeddedCover() = %v, want %v", got, tt.want)
			}
		})
	}
}
