// Package autotag provides methods to auto-tag audios with performers,
// studios and tags.
//
// The autotag engine tags audios with performers/studios/tags if the audio's
// path matches the performer/studio/tag name. A audio's path is considered
// a match if it contains the performer/studio/tag's full name, ignoring any
// '.', '-', '_' characters in the path.
package autotag

import (
	"context"
	"fmt"

	"github.com/stashapp/stash_audio/pkg/logger"
	"github.com/stashapp/stash_audio/pkg/match"
	"github.com/stashapp/stash_audio/pkg/models"
	"github.com/stashapp/stash_audio/pkg/txn"
)

type Tagger struct {
	TxnManager txn.Manager
	Cache      *match.Cache
}

type tagger struct {
	ID      int
	Type    string
	Name    string
	Path    string
	trimExt bool

	cache *match.Cache
}

type addLinkFunc func(subjectID, otherID int) (bool, error)
type addAudioLinkFunc func(o *models.Audio) (bool, error)

func (t *tagger) addError(otherType, otherName string, err error) error {
	return fmt.Errorf("error adding %s '%s' to %s '%s': %s", otherType, otherName, t.Type, t.Name, err.Error())
}

func (t *tagger) addLog(otherType, otherName string) {
	logger.Infof("Added %s '%s' to %s '%s'", otherType, otherName, t.Type, t.Name)
}

func (t *tagger) tagPerformers(ctx context.Context, performerReader models.PerformerAutoTagQueryer, addFunc addLinkFunc) error {
	others, err := match.PathToPerformers(ctx, t.Path, performerReader, t.cache, t.trimExt)
	if err != nil {
		return err
	}

	for _, p := range others {
		added, err := addFunc(t.ID, p.ID)

		if err != nil {
			return t.addError("performer", p.Name, err)
		}

		if added {
			t.addLog("performer", p.Name)
		}
	}

	return nil
}

func (t *tagger) tagStudios(ctx context.Context, studioReader models.StudioAutoTagQueryer, addFunc addLinkFunc) error {
	studio, err := match.PathToStudio(ctx, t.Path, studioReader, t.cache, t.trimExt)
	if err != nil {
		return err
	}

	if studio != nil {
		added, err := addFunc(t.ID, studio.ID)

		if err != nil {
			return t.addError("studio", studio.Name, err)
		}

		if added {
			t.addLog("studio", studio.Name)
		}
	}

	return nil
}

func (t *tagger) tagAudios(ctx context.Context, paths []string, audioReader models.AudioQueryer, addFunc addAudioLinkFunc) error {
	return match.PathToAudiosFn(ctx, t.Name, paths, audioReader, func(ctx context.Context, a *models.Audio) error {
		added, err := addFunc(a)
		if err != nil {
			return t.addError("audio", a.DisplayName(), err)
		}
		if added {
			t.addLog("audio", a.DisplayName())
		}
		return nil
	})
}

func (t *tagger) tagTags(ctx context.Context, tagReader models.TagAutoTagQueryer, addFunc addLinkFunc) error {
	others, err := match.PathToTags(ctx, t.Path, tagReader, t.cache, t.trimExt)
	if err != nil {
		return err
	}

	for _, p := range others {
		added, err := addFunc(t.ID, p.ID)

		if err != nil {
			return t.addError("tag", p.Name, err)
		}

		if added {
			t.addLog("tag", p.Name)
		}
	}

	return nil
}
