# Audio File Support — Implementation Plan

Tracking issue: https://github.com/stashapp/stash/issues/1258

## Overview

This document breaks the implementation of audio file support into discrete, incremental tasks that a coding agent can execute sequentially. Each task is designed to be self-contained and leave the codebase in a buildable, working state.

Audio files are modelled very closely after `Scene`, with a few key differences:
- No video-specific fields (codec, width, height, framerate, frame_rate)
- No gallery or group associations
- No interactive/funscript support
- Cover art is a stored image (similar to scene cover) rather than a generated screenshot
- Has `o_counter` (like Scene and Image)
- Markers supported (timed annotations with a WebVTT track)
- HLS streaming is audio-only (the audio stream extracted/remuxed)

Reference models: `Scene` (primary) and `Image` (for cover art pattern).

---

## Architecture Reference

| Layer | Scene example | Audio equivalent |
|---|---|---|
| Go model | `pkg/models/model_scene.go` | `pkg/models/model_audio.go` |
| Repository interface | `pkg/models/repository_scene.go` | `pkg/models/repository_audio.go` |
| DB migration | `pkg/sqlite/migrations/1_initial.up.sql` | `pkg/sqlite/migrations/85_audios.up.sql` |
| SQLite CRUD | `pkg/sqlite/scene.go` | `pkg/sqlite/audio.go` |
| File decorator | `pkg/file/video/scan.go` | `pkg/file/audio/scan.go` |
| Manager/streaming | `internal/manager/scene.go` | `internal/manager/audio.go` |
| Routes | `internal/api/routes_scene.go` | `internal/api/routes_audio.go` |
| GraphQL schema | `graphql/schema/types/scene.graphql` | `graphql/schema/types/audio.graphql` |
| GQL resolvers | `internal/api/resolver_{model,query,mutation}_scene.go` | `internal/api/resolver_{model,query,mutation}_audio.go` |
| GQL client fragments | `ui/v2.5/graphql/data/scene.graphql` | `ui/v2.5/graphql/data/audio.graphql` |
| GQL client queries | `ui/v2.5/graphql/queries/scene.graphql` | `ui/v2.5/graphql/queries/audio.graphql` |
| GQL client mutations | `ui/v2.5/graphql/mutations/scene.graphql` | `ui/v2.5/graphql/mutations/audio.graphql` |
| React routes | `ui/v2.5/src/components/Scenes/` | `ui/v2.5/src/components/Audios/` |

---

## Task List

### Phase 1 — Data Model & Database

#### Task 1.1 — Go data model (`pkg/models/model_audio.go`)

Create the `Audio` struct and its related input/partial types.

Fields:
```go
type Audio struct {
    ID           int
    Title        string
    // code omitted intentionally — see field list below
}
```

Full field set (mirroring Scene minus video-only fields):
- `ID int`
- `Title string`
- `Details string`
- `Date *Date`
- `Rating *int`          // 1–100
- `OCounter int`
- `Organized bool`
- `StudioID *int`
- `CreatedAt time.Time`
- `UpdatedAt time.Time`
- Transient (populated by repository joins):
  - `Files RelatedFiles`     // AudioFile entries
  - `PrimaryFileID *FileID`
  - `URLs RelatedStrings`
  - `TagIDs RelatedIDs`
  - `PerformerIDs RelatedIDs`
  - `StashIDs RelatedStashIDs`

Create:
- `NewAudio() *Audio`
- `AudioCreateInput` struct
- `AudioPartial` struct (all optional fields, for partial updates)
- `LoadRelationships` methods following the same lazy-load pattern as Scene

File: `pkg/models/model_audio.go`

---

#### Task 1.2 — Audio file metadata type (`pkg/models/`)

The audio file type wraps the generic `BaseFile` with audio-specific probe metadata.

Fields (subset of `VideoFile`, audio-only):
- `Duration float64`
- `AudioCodec string`
- `Bitrate int64`
- `Format string`      // container format, e.g. "mp3", "flac", "ogg"
- `SampleRate int`
- `Channels int`

Create type `AudioFile` in `pkg/models/file.go` (or a new `pkg/models/file_audio.go`) following the pattern of `VideoFile`. Register a new `FileType` constant (e.g., `FileTypeAudio`).

---

#### Task 1.3 — Repository interfaces (`pkg/models/repository_audio.go`)

Define the data-access interfaces following `repository_scene.go`:

```go
AudioGetter        // Find(ctx, id) (*Audio, error); FindMany(ctx, ids)
AudioFinder        // FindByChecksum, FindByFileID, FindByPerformerID, FindByPath
AudioQueryer       // Query(ctx, filter, sort) ([]*Audio, int, error)
AudioCounter       // Count, CountByPerformerID, etc.
AudioCreator       // Create(ctx, audio, fileIDs)
AudioUpdater       // Update(ctx, audio); UpdatePartial(ctx, id, partial)
AudioDestroyer     // Destroy(ctx, id)
AudioReader        // composite read interface
AudioWriter        // composite write interface
```

---

#### Task 1.4 — Database migration (`pkg/sqlite/migrations/85_audios.up.sql`)

Create the SQL migration. Use the next available number (currently 84 is the last).

Tables to create:

```sql
-- main table
CREATE TABLE `audios` (
  `id`          integer not null primary key autoincrement,
  `title`       varchar(255),
  `details`     text,
  `date`        date,
  `rating`      tinyint,
  `o_counter`   tinyint not null default 0,
  `organized`   boolean not null default 0,
  `studio_id`   integer references `studios`(`id`) on delete set null,
  `created_at`  datetime not null,
  `updated_at`  datetime not null
);

-- relationship tables (follow the same pattern as scenes_tags, performers_scenes, etc.)
CREATE TABLE `audios_tags`        ( `audio_id` integer, `tag_id` integer, primary key (`audio_id`, `tag_id`) );
CREATE TABLE `performers_audios`  ( `performer_id` integer, `audio_id` integer, primary key (`performer_id`, `audio_id`) );
CREATE TABLE `audios_urls`        ( `audio_id` integer, `url` varchar(255), `position` integer, primary key (`audio_id`, `position`) );
CREATE TABLE `audios_stash_ids`   ( `audio_id` integer, `endpoint` varchar, `stash_id` varchar, primary key (`audio_id`, `endpoint`) );
CREATE TABLE `audios_cover`       ( `audio_id` integer not null primary key, `cover` blob not null );

-- files_audios join (audio can have multiple files — same file model as scenes/images)
CREATE TABLE `audios_files` (
  `audio_id`   integer not null references `audios`(`id`) on delete cascade,
  `file_id`    integer not null references `files`(`id`) on delete cascade,
  `primary`    boolean not null default 0,
  primary key  (`audio_id`, `file_id`)
);
```

File: `pkg/sqlite/migrations/85_audios.up.sql`

---

#### Task 1.5 — SQLite repository implementation (`pkg/sqlite/audio.go`)

Implement the `AudioStore` struct satisfying all interfaces from Task 1.3. Follow `pkg/sqlite/scene.go` as a template.

Key methods to implement:
- `Create`, `Update`, `UpdatePartial`, `Destroy`
- `Find`, `FindMany`, `FindByIDs`
- `FindByChecksum`, `FindByFileID`, `FindByPerformerID`, `FindByPath`
- `Query` / `QueryCount` (with `AudioFilterType` — see Task 3.1)
- Relationship loaders: `GetTagIDs`, `GetPerformerIDs`, `GetURLs`, `GetStashIDs`, `GetFiles`
- Cover blob helpers: `GetCover`, `UpdateCover`, `DestroyCover`

Wire the store into `pkg/sqlite/database.go` and `pkg/sqlite/setup.go`.

---

### Phase 2 — File Scanning & Library Integration

#### Task 2.1 — Audio file decorator (`pkg/file/audio/scan.go`)

Create `pkg/file/audio/` package with a `Decorator` that uses ffprobe to extract audio metadata (duration, bitrate, codec, sample rate, channels, format). Pattern: `pkg/file/video/scan.go`.

The decorator creates an `AudioFile` (from Task 1.2) and attaches it to the scanned `BaseFile`.

Supported default extensions:
```
mp3, mp4, m4a, aac, ogg, oga, opus, flac, wav, wma, alac, aiff, aif
```

Note: `mp4` and `m4a` overlap with video extensions. The scanner should detect audio-only mp4/m4a via the ffprobe stream inspection (no video stream present).

---

#### Task 2.2 — Configuration: `audioExtensions` and `excludedAudioPatterns` (`internal/manager/config/config.go`)

Following the existing pattern for `video_extensions` / `image_extensions`:

1. Add constants:
   ```go
   AudioExtensions           = "audio_extensions"
   ExcludedAudioPatterns     = "excluded_audio_patterns"
   ```

2. Add defaults:
   ```go
   defaultAudioExtensions = []string{"mp3", "mp4", "m4a", "aac", "ogg", "oga", "opus", "flac", "wav", "wma", "aiff", "aif"}
   ```

3. Add getter methods `GetAudioExtensions()` and `GetExcludedAudioPatterns()`.

4. Update the GraphQL config schema (`graphql/schema/types/config.graphql`) to expose:
   - `audioExtensions: [String!]!`
   - `excludedAudioPatterns: [String!]!`
   - On `ConfigLibraryInput` and `ConfigLibraryResult`

5. Update config resolvers in `internal/api/resolver_config.go`.

---

#### Task 2.3 — Wire audio scanning into the library scan pipeline (`internal/manager/`)

1. Register the audio `Decorator` and `Handler` in the scanner setup (see how video/image handlers are registered in `internal/manager/manager.go` and `internal/manager/task_scan.go`).

2. Create an `audioFileHandler` (similar to `sceneFileHandler`) that:
   - On new audio file found: creates an `Audio` record linked to the file.
   - On existing audio file (same checksum): updates metadata, no duplicate creation.
   - On missing file: follows existing orphan/clean logic.

3. Ensure `excludedAudioPatterns` is applied as a `PathFilter` in the scanner.

---

#### Task 2.4 — File identification and fingerprinting for audio

Extend the fingerprinting/phash pipeline to support `AudioFile`:
- Compute `MD5` checksum (already done generically by the base scanner).
- No perceptual hash needed (audio files don't have image frames).
- Ensure `FindByChecksum` / `FindByOSHash` work for deduplication.

---

### Phase 3 — GraphQL API

#### Task 3.1 — GraphQL schema: types and filters (`graphql/schema/types/audio.graphql`)

Define:

```graphql
type Audio {
  id: ID!
  title: String
  details: String
  date: String
  rating100: Int
  o_counter: Int
  organized: Boolean!
  created_at: Time!
  updated_at: Time!

  # relationships
  studio: Studio
  tags: [Tag!]!
  performers: [Performer!]!
  urls: [String!]!
  stash_ids: [StashID!]!

  # file info (primary file)
  files: [AudioFile!]!
  paths: AudioPathsType!
}

type AudioFile {
  id: ID!
  path: String!
  size: Int64!
  duration: Float
  audio_codec: String
  bitrate: Int
  format: String
  sample_rate: Int
  channels: Int
  created_at: Time!
  updated_at: Time!
  fingerprints: [Fingerprint!]!
}

type AudioPathsType {
  screenshot: String  # cover art URL
  stream: String      # direct audio stream
  hls: String         # HLS m3u8 playlist
  vtt: String         # WebVTT subtitles (markers)
}

type FindAudiosResultType {
  count: Int!
  duration: Float
  audios: [Audio!]!
}

input AudioCreateInput {
  title: String
  details: String
  date: String
  rating100: Int
  organized: Boolean
  studio_id: ID
  tag_ids: [ID!]
  performer_ids: [ID!]
  urls: [String!]
  stash_ids: [StashID!]
  cover_image: String  # base64-encoded cover art
}

input AudioUpdateInput {
  id: ID!
  # ... same optional fields as Create
  cover_image: String
}

input BulkAudioUpdateInput {
  ids: [ID!]!
  # ... bulk-editable subset of fields
}

input AudioDestroyInput {
  id: ID!
  delete_file: Boolean
  delete_generated: Boolean
}

input AudioFilterType {
  AND: AudioFilterType
  OR:  AudioFilterType
  NOT: AudioFilterType

  title:         StringCriterionInput
  details:       StringCriterionInput
  path:          StringCriterionInput
  checksum:      StringCriterionInput
  rating100:     IntCriterionInput
  o_counter:     IntCriterionInput
  organized:     Boolean
  duration:      IntCriterionInput
  bitrate:       IntCriterionInput
  has_markers:   String
  is_missing:    String          # "studio", "tags", "performers", "cover_image"
  url:           StringCriterionInput
  studios:       HierarchicalMultiCriterionInput
  tags:          HierarchicalMultiCriterionInput
  tag_count:     IntCriterionInput
  performers:    MultiCriterionInput
  performer_count: IntCriterionInput
  stash_id_endpoint: StashIDCriterionInput
  file_count:    IntCriterionInput
  created_at:    TimestampCriterionInput
  updated_at:    TimestampCriterionInput
  date:          DateCriterionInput
}

enum AudioSortEnum {
  title
  date
  rating
  o_counter
  duration
  bitrate
  created_at
  updated_at
  random
}
```

Add to `graphql/schema/schema.graphql`:
```graphql
# Queries
findAudio(id: ID!): Audio
findAudios(
  audio_filter: AudioFilterType
  filter: FindFilterType
): FindAudiosResultType!
findAudiosByPathRegex(filter: FindFilterType): FindAudiosResultType!
findAudioMarkers(
  audio_marker_filter: AudioMarkerFilterType
  filter: FindFilterType
): FindAudioMarkersResultType!

# Mutations
audioCreate(input: AudioCreateInput!): Audio
audioUpdate(input: AudioUpdateInput!): Audio
audiosUpdate(input: [AudioUpdateInput!]!): [Audio]
bulkAudioUpdate(input: BulkAudioUpdateInput!): [Audio!]
audioDestroy(input: AudioDestroyInput!): Boolean!
audiosDestroy(ids: [ID!]!): Boolean!
audioIncrementO(id: ID!): OCountResult!
audioDecrementO(id: ID!): OCountResult!
audioResetO(id: ID!): OCountResult!
audioIncrementPlayCount(id: ID!): Int
audioDecrementPlayCount(id: ID!): Int
assignAudioFile(input: AssignFileInput!): Boolean!
```

---

#### Task 3.2 — Audio markers schema (`graphql/schema/types/audio-marker.graphql`)

Define `AudioMarker` following `SceneMarker`:

```graphql
type AudioMarker {
  id: ID!
  title: String!
  seconds: Float!
  end_seconds: Float
  stream: String!   # URL to stream from this marker
  screenshot: String!
  preview: String!
  primary_tag: Tag!
  tags: [Tag!]!
  audio: Audio!
  created_at: Time!
  updated_at: Time!
}
```

Add CRUD mutations: `audioMarkerCreate`, `audioMarkerUpdate`, `audioMarkerDestroy`.

---

#### Task 3.3 — Go GraphQL resolvers (`internal/api/`)

Create three resolver files following existing scene resolver patterns:

**`resolver_model_audio.go`** — field resolvers for `Audio` type:
- `Studio`, `Tags`, `Performers`, `URLs`, `StashIDs`, `Files`, `Paths`
- `PlayCount`, `OCounter`, etc.

**`resolver_query_find_audio.go`** — query implementations:
- `FindAudio`, `FindAudios`, `FindAudiosByPathRegex`

**`resolver_mutation_audio.go`** — mutation implementations:
- `AudioCreate`, `AudioUpdate`, `AudiosUpdate`, `BulkAudioUpdate`
- `AudioDestroy`, `AudiosDestroy`
- `AudioIncrementO`, `AudioDecrementO`, `AudioResetO`
- `AudioIncrementPlayCount`, `AudioDecrementPlayCount`
- `AssignAudioFile`

Wire into `internal/api/resolver.go`.

---

#### Task 3.4 — Audio marker resolvers

Create `resolver_mutation_audio_marker.go` and extend query resolver for `FindAudioMarkers`, `AudioMarkerWall`, `AudioMarkerTags`.

---

### Phase 4 — Streaming & HTTP Routes

#### Task 4.1 — Audio streaming manager (`internal/manager/audio.go`)

Following `internal/manager/scene.go`, create stream endpoints for audio:

```go
var (
    directEndpoint = endpointType{"Direct stream", ffmpeg.MimeAudio, ""}
    hlsEndpoint    = endpointType{"HLS", ffmpeg.MimeHLS, ".m3u8"}
)
```

- `GetAudioStreamEndpoints(audio *models.Audio) ([]*AudioStreamEndpoint, error)`
- Support direct stream (pass-through if codec is browser-compatible) and HLS remux.
- For HLS: extract only audio track into AAC/HLS segments.

---

#### Task 4.2 — HTTP routes for audio (`internal/api/routes_audio.go`)

Following `internal/api/routes_scene.go`:

```
GET /audio/{audioId}/stream          — direct audio stream
GET /audio/{audioId}/stream.m3u8     — HLS manifest
GET /audio/{audioId}/stream.m3u8/{segment}.ts — HLS segment
GET /audio/{audioId}/screenshot      — cover art image
GET /audio/{audioId}/vtt/chapter     — WebVTT chapters from markers
```

Register routes in `internal/api/server.go`.

---

#### Task 4.3 — Cover art storage and retrieval

Cover art is stored as a blob in `audios_cover` (from Task 1.4). Implement:
- `GetCover(ctx, audioID) ([]byte, error)` on `AudioStore`
- `UpdateCover(ctx, audioID, image []byte) error`
- Serve via the `/audio/{audioId}/screenshot` route
- Accept base64-encoded cover art in `AudioCreateInput.cover_image` / `AudioUpdateInput.cover_image`

---

### Phase 5 — React Frontend

#### Task 5.1 — GraphQL client fragments and queries (`ui/v2.5/graphql/`)

Create:
- `ui/v2.5/graphql/data/audio.graphql` — `AudioDataFragment`, `AudioFileDataFragment`, `SlimAudioDataFragment`
- `ui/v2.5/graphql/queries/audio.graphql` — `FindAudio`, `FindAudios`, `FindAudioMarkers`
- `ui/v2.5/graphql/mutations/audio.graphql` — all mutations from Task 3.3

Run `yarn codegen` to generate TypeScript types.

---

#### Task 5.2 — Audio list and card components

Create `ui/v2.5/src/components/Audios/`:

- `AudioCard.tsx` — displays cover art, title, duration, rating, tags. Pattern: `SceneCard.tsx`.
- `AudioCardGrid.tsx` — grid layout wrapping `AudioCard`. Pattern: `SceneCardGrid.tsx`.
- `AudioList.tsx` — main list view with filter sidebar, sort controls, pagination. Pattern: `SceneList.tsx`.

The list should support the same view modes as Scenes (grid, list, wall).

---

#### Task 5.3 — Audio filter components

Create `ui/v2.5/src/components/Audios/AudioFilter.tsx` (or extend the shared filter system):

- Wire `AudioFilterType` fields into filter UI controls.
- Reuse existing criterion components (RatingCriterion, TagsCriterion, PerformersCriterion, etc.) that are already shared across Scene/Image/Gallery.

Add `AudioSortEnum` to the sort selector.

---

#### Task 5.4 — Audio details page (`AudioDetails/`)

Create `ui/v2.5/src/components/Audios/AudioDetails/`:

- `Audio.tsx` — top-level detail page with tabs:
  - **Details** — read-only view of title, date, studio, performers, tags, rating, URLs
  - **Edit** — inline edit form (mirrors `SceneEditPanel.tsx`)
  - **File Info** — file path, size, duration, bitrate, codec, fingerprints
  - **Markers** — list of `AudioMarker` objects; add/edit/delete inline
  - **History** — play count, o-counter history
- `AudioDetailPanel.tsx` — details tab content
- `AudioEditPanel.tsx` — edit tab content; handles save/revert
- `AudioFileInfoPanel.tsx` — file info tab
- `AudioMarkersPanel.tsx` — markers tab

Pattern: `SceneDetails/Scene.tsx`, `SceneDetailPanel.tsx`, `SceneEditPanel.tsx`, `SceneFileInfoPanel.tsx`, `SceneMarkersPanel.tsx`.

---

#### Task 5.5 — Audio player with HLS and cover art

Create `ui/v2.5/src/components/Audios/AudioPlayer.tsx`:

- Uses `hls.js` (already a dependency via scene player).
- Displays cover art above the player controls.
- Shows title and performer(s).
- Supports WebVTT chapter track from markers (loaded via `/audio/{id}/vtt/chapter`).
- Controls: play/pause, seek bar, volume, playback rate, download.

Reuse the existing `ScenePlayer` HLS infrastructure where possible. The main difference is rendering cover art instead of a video canvas.

---

#### Task 5.6 — Bulk edit and delete dialogs

Create:
- `EditAudiosDialog.tsx` — bulk edit: rating, studio, tags, performers, organized. Pattern: `EditScenesDialog.tsx`.
- `DeleteAudiosDialog.tsx` — bulk delete with optional file deletion. Pattern: `DeleteScenesDialog.tsx`.

---

#### Task 5.7 — "Audios" top-level navigation tab

1. Add an `Audios` route entry in `ui/v2.5/src/components/Audios/Audios.tsx`:
   ```
   /audios          → AudioList
   /audios/:id      → Audio (detail)
   /audios/new      → AudioCreate (optional, for manual entry)
   ```

2. Add `Audios` link to the main navigation sidebar in `ui/v2.5/src/components/MainNavbar.tsx` (or equivalent), between `Scenes` and `Images`.

3. Add `Audios` to the stats page (`/stats`) following the scene/image pattern.

---

### Phase 6 — Settings UI

#### Task 6.1 — Library settings for audio

Update `ui/v2.5/src/components/Settings/SettingsLibraryPanel.tsx` (or equivalent):

- Add `audioExtensions` field (multi-value text input, seeded with defaults).
- Add `excludedAudioPatterns` field (multi-value text input).
- Add `excludeAudio: Boolean` toggle per stash library (in the stash config section), following `excludeVideo` / `excludeImage`.

Update the GraphQL config mutation to accept these new fields.

---

### Phase 7 — Auto-tagging & Scrapers

#### Task 7.1 — Auto-tag support for audio

Extend the auto-tagging pipeline (`internal/autotag/`) to support `Audio`:
- `AudioTagger` following `SceneTagger` — match performers, studios, tags from filename/path.
- Register in the auto-tag task manager.

---

#### Task 7.2 — Scraper support for audio (optional, stretch goal)

Extend the scraper framework (`internal/scraper/`) to support an `AudioScraped` type so that metadata can be pulled from external sources. This is a large task and can be deferred to a follow-up.

---

## Build Order Summary

```
Phase 1  →  Phase 2  →  Phase 3  →  Phase 4  →  Phase 5  →  Phase 6  →  Phase 7
Data model  Scanning    GraphQL API  Streaming   Frontend    Settings    Autotag
```

Each phase depends on the previous, but within a phase tasks can often be parallelised. The backend (Phases 1–4) must be complete before the frontend (Phase 5) can be wired to real data, but frontend components can be scaffolded with mock data in parallel.

---

## Key Files to Reference

| Purpose | Path |
|---|---|
| Scene model (template) | `pkg/models/model_scene.go` |
| Scene SQLite store | `pkg/sqlite/scene.go` |
| Video file decorator | `pkg/file/video/scan.go` |
| Config extensions | `internal/manager/config/config.go` |
| Scene GraphQL schema | `graphql/schema/types/scene.graphql` |
| Scene marker schema | `graphql/schema/types/scene-marker.graphql` |
| Scene stream manager | `internal/manager/scene.go` |
| Scene HTTP routes | `internal/api/routes_scene.go` |
| Scene React list | `ui/v2.5/src/components/Scenes/SceneList.tsx` |
| Scene React detail | `ui/v2.5/src/components/Scenes/SceneDetails/Scene.tsx` |
| Scene GQL fragments | `ui/v2.5/graphql/data/scene.graphql` |
| Last DB migration | `pkg/sqlite/migrations/84_folder_basename.up.sql` |
