package urlbuilders

import (
	"strconv"

	"github.com/stashapp/stash/pkg/models"
)

type AudioURLBuilder struct {
	BaseURL   string
	AudioID   string
	UpdatedAt string
}

func NewAudioURLBuilder(baseURL string, audio *models.Audio) AudioURLBuilder {
	return AudioURLBuilder{
		BaseURL:   baseURL,
		AudioID:   strconv.Itoa(audio.ID),
		UpdatedAt: strconv.FormatInt(audio.UpdatedAt.Unix(), 10),
	}
}

func (b AudioURLBuilder) GetScreenshotURL() string {
	return b.BaseURL + "/audio/" + b.AudioID + "/screenshot?t=" + b.UpdatedAt
}

func (b AudioURLBuilder) GetStreamURL() string {
	return b.BaseURL + "/audio/" + b.AudioID + "/stream"
}

func (b AudioURLBuilder) GetVTTURL() string {
	return b.BaseURL + "/audio/" + b.AudioID + "/vtt/chapter"
}
