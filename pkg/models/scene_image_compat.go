package models

// Stub types retained for source compatibility with scene/image/gallery code
// that is dead in the audio-only fork.

type ResolutionCriterionInput struct {
	Value    ResolutionEnum    `json:"value"`
	Modifier CriterionModifier `json:"modifier"`
}

type PhashDistanceCriterionInput struct {
	Value    string            `json:"value"`
	Modifier CriterionModifier `json:"modifier"`
	Distance *int              `json:"distance,omitempty"`
}

type OrientationCriterionInput struct {
	Value []OrientationEnum `json:"value"`
}

type SceneMovieInput struct {
	MovieID    string  `json:"movie_id"`
	SceneIndex *int    `json:"scene_index,omitempty"`
}

// SceneMovieInputs is a no-op stub for audio-only builds.
func (u *UpdateGroupIDs) SceneMovieInputs() []SceneMovieInput { return nil }
