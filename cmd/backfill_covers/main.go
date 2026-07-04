// backfill_covers is a standalone maintenance tool. It walks every Audio and
// Group in an existing stash_audio database and, for any that are still
// missing a cover/front image, tries to find one on disk now (e.g. a
// cover.jpg dropped into a folder after the initial scan) and applies it.
// It never overwrites a cover that's already set.
//
// Usage:
//
//	go run ./cmd/backfill_covers -db /path/to/stash_audio.sqlite [-dry-run]
//
// If your instance stores blobs (covers, images) on the filesystem rather
// than in the database (blobs_storage: FILESYSTEM in config.yml), also pass
// -blobs-storage filesystem -blobs-path /path/to/blobs, matching your
// config.yml's blobs_path.
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/stashapp/stash_audio/pkg/audio"
	"github.com/stashapp/stash_audio/pkg/ffmpeg"
	"github.com/stashapp/stash_audio/pkg/logger"
	"github.com/stashapp/stash_audio/pkg/sqlite"
	"github.com/stashapp/stash_audio/pkg/txn"
)

var errDryRun = errors.New("dry run: discarding changes")

func main() {
	dbPath := flag.String("db", "", "path to the stash_audio sqlite database file (required)")
	dryRun := flag.Bool("dry-run", false, "report what would change without writing to the database")
	blobsStorage := flag.String("blobs-storage", "database", `where blobs are stored: "database" or "filesystem" (must match your config.yml's blobs_storage)`)
	blobsPath := flag.String("blobs-path", "", "filesystem path for blobs (must match config.yml's blobs_path; required if -blobs-storage=filesystem)")
	flag.Parse()

	if *dbPath == "" {
		fmt.Fprintln(os.Stderr, "Usage: backfill_covers -db /path/to/stash_audio.sqlite [-dry-run] [-blobs-storage filesystem -blobs-path /path/to/blobs]")
		os.Exit(2)
	}
	if *blobsStorage != "database" && *blobsStorage != "filesystem" {
		fmt.Fprintf(os.Stderr, "invalid -blobs-storage %q: must be \"database\" or \"filesystem\"\n", *blobsStorage)
		os.Exit(2)
	}
	if *blobsStorage == "filesystem" && *blobsPath == "" {
		fmt.Fprintln(os.Stderr, "-blobs-path is required when -blobs-storage=filesystem")
		os.Exit(2)
	}

	logger.Logger = &logger.BasicLogger{}

	db := sqlite.NewDatabase()
	if err := db.Open(*dbPath); err != nil {
		fmt.Fprintf(os.Stderr, "opening database: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()

	db.SetBlobStoreOptions(sqlite.BlobStoreOptions{
		UseFilesystem: *blobsStorage == "filesystem",
		UseDatabase:   *blobsStorage == "database",
		Path:          *blobsPath,
	})

	ffmpegPath, _ := exec.LookPath("ffmpeg")
	scanHandler := &audio.ScanHandler{
		CoverUpdater: db.Audio,
		FFMpeg:       ffmpeg.NewEncoder(ffmpegPath),
	}

	var audioBackfilled, audioSkipped, groupBackfilled, groupSkipped int

	err := txn.WithTxn(context.Background(), db, func(ctx context.Context) error {
		var err error

		audioBackfilled, audioSkipped, err = backfillAudioCovers(ctx, db, scanHandler)
		if err != nil {
			return fmt.Errorf("backfilling audio covers: %w", err)
		}

		groupBackfilled, groupSkipped, err = backfillGroupCovers(ctx, db)
		if err != nil {
			return fmt.Errorf("backfilling group covers: %w", err)
		}

		if *dryRun {
			return errDryRun
		}
		return nil
	})

	if err != nil && !errors.Is(err, errDryRun) {
		fmt.Fprintf(os.Stderr, "backfill failed, no changes were saved: %v\n", err)
		os.Exit(1)
	}

	verb := "backfilled"
	if *dryRun {
		verb = "would be backfilled (dry run, no changes written)"
	}
	fmt.Printf("Audios: %d %s, %d skipped (already had a cover or none found)\n", audioBackfilled, verb, audioSkipped)
	fmt.Printf("Groups: %d %s, %d skipped (already had a front image, no matching folder, or none found)\n", groupBackfilled, verb, groupSkipped)
}

// backfillAudioCovers finds a cover for every audio that doesn't have one
// yet, reusing the same sidecar-file / embedded-art logic scan uses for
// newly added files.
func backfillAudioCovers(ctx context.Context, db *sqlite.Database, h *audio.ScanHandler) (backfilled int, skipped int, err error) {
	audios, err := db.Audio.All(ctx)
	if err != nil {
		return 0, 0, fmt.Errorf("listing audios: %w", err)
	}

	for _, a := range audios {
		hasCover, err := db.Audio.HasCover(ctx, a.ID)
		if err != nil {
			return backfilled, skipped, fmt.Errorf("checking cover for audio %d: %w", a.ID, err)
		}
		if hasCover {
			skipped++
			continue
		}

		files, err := db.Audio.GetFiles(ctx, a.ID)
		if err != nil {
			return backfilled, skipped, fmt.Errorf("getting files for audio %d: %w", a.ID, err)
		}

		for _, f := range files {
			h.ExtractCoverIfMissing(ctx, a.ID, f.Base().Path)
		}

		nowHasCover, err := db.Audio.HasCover(ctx, a.ID)
		if err != nil {
			return backfilled, skipped, fmt.Errorf("re-checking cover for audio %d: %w", a.ID, err)
		}
		if nowHasCover {
			backfilled++
			fmt.Printf("audio %d (%s): cover backfilled\n", a.ID, a.DisplayName())
		} else {
			skipped++
		}
	}

	return backfilled, skipped, nil
}

// backfillGroupCovers finds a front image for every group that doesn't have
// one yet, but only when the group unambiguously maps to a single folder on
// disk (all of its audios' files share one parent directory whose name
// matches the group's name). Groups with no audios, or whose audios don't
// map to a single matching folder, are skipped.
func backfillGroupCovers(ctx context.Context, db *sqlite.Database) (backfilled int, skipped int, err error) {
	groups, err := db.Group.All(ctx)
	if err != nil {
		return 0, 0, fmt.Errorf("listing groups: %w", err)
	}

	for _, g := range groups {
		hasImage, err := db.Group.HasFrontImage(ctx, g.ID)
		if err != nil {
			return backfilled, skipped, fmt.Errorf("checking front image for group %d: %w", g.ID, err)
		}
		if hasImage {
			skipped++
			continue
		}

		audioIDs, err := db.Group.GetAudioIDs(ctx, g.ID)
		if err != nil {
			return backfilled, skipped, fmt.Errorf("getting audio ids for group %d: %w", g.ID, err)
		}
		if len(audioIDs) == 0 {
			skipped++
			continue
		}

		dir, ok, err := matchingFolder(ctx, db, g.Name, audioIDs)
		if err != nil {
			return backfilled, skipped, fmt.Errorf("resolving folder for group %d: %w", g.ID, err)
		}
		if !ok {
			skipped++
			continue
		}

		cover := audio.FindFolderCover(dir)
		if len(cover) == 0 {
			skipped++
			continue
		}

		if err := db.Group.UpdateFrontImage(ctx, g.ID, cover); err != nil {
			return backfilled, skipped, fmt.Errorf("updating front image for group %d: %w", g.ID, err)
		}
		backfilled++
		fmt.Printf("group %d (%s): front image backfilled from %s\n", g.ID, g.Name, dir)
	}

	return backfilled, skipped, nil
}

// matchingFolder returns the single directory shared by all of a group's
// audio files, if that directory's name matches groupName (case-insensitive).
// ok is false if the audios don't all share exactly one directory, or that
// directory's name doesn't match.
func matchingFolder(ctx context.Context, db *sqlite.Database, groupName string, audioIDs []int) (dir string, ok bool, err error) {
	for _, audioID := range audioIDs {
		files, err := db.Audio.GetFiles(ctx, audioID)
		if err != nil {
			return "", false, err
		}
		for _, f := range files {
			d := filepath.Dir(f.Base().Path)
			if dir == "" {
				dir = d
			} else if dir != d {
				return "", false, nil // audios span multiple folders, ambiguous
			}
		}
	}

	if dir == "" || !strings.EqualFold(filepath.Base(dir), groupName) {
		return "", false, nil
	}

	return dir, true, nil
}
