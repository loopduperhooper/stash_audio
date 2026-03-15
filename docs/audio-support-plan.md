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

### Phase 1 — Data Model & Database ✅ COMPLETE

#### Task 1.1 — Go data model ✅

File: `pkg/models/model_audio.go`

Implemented: `Audio` struct, `AudioPartial`, `CreateAudioInput`, `UpdateAudioInput`, `NewAudio()`, `NewAudioPartial()`, all `LoadRelationships` methods.

Additional fields beyond the original plan: `ResumeTime float64`, `PlayDuration float64`.

**Gap found — `PlayCount` and `LastPlayedAt` missing from Go model:**
The DB migration includes `play_count` and `last_played_at` columns, and the sort infrastructure references them, but neither the `Audio` struct, `AudioPartial`, `audioRow`, nor `audioQueryRow.resolve()` map these fields. These must be added:
- Add `PlayCount int` and `LastPlayedAt *time.Time` to `Audio` struct
- Add `PlayCount OptionalInt` and `LastPlayedAt OptionalTime` to `AudioPartial`
- Add `PlayCount` and `LastPlayedAt` to `audioRow`, `fromAudio()`, `resolve()`, and `fromPartial()`

---

#### Task 1.2 — Audio file metadata type ✅

Implemented in `pkg/models/model_file.go`. `AudioFile` type with fields: `Duration`, `AudioCodec`, `Format`, `BitRate`, `SampleRate`, `Channels`.

---

#### Task 1.3 — Repository interfaces ✅

File: `pkg/models/repository_audio.go`

All interfaces defined: `AudioGetter`, `AudioFinder`, `AudioQueryer`, `AudioCounter`, `AudioCreator`, `AudioUpdater`, `AudioDestroyer`, `AudioReader`, `AudioWriter`.

---

#### Task 1.4 — Database migration ✅

File: `pkg/sqlite/migrations/85_audios.up.sql`

Tables created: `audios`, `audio_files`, `audios_files`, `audio_urls`, `performers_audios`, `audios_tags`, `audio_stash_ids`, `audio_o_dates`, `audio_view_dates`, `audio_markers`, `audio_markers_tags`.

Implementation differs from original plan in several ways (all improvements):
- Uses `cover_blob` referencing `blobs` table (matches Scene pattern) instead of a separate `audios_cover` table
- Includes `resume_time`, `play_count`, `play_duration`, `last_played_at` columns
- Includes `audio_files` table for audio-specific metadata (duration, codec, format, etc.)
- Includes `audio_markers` and `audio_markers_tags` tables
- Includes `audio_o_dates` and `audio_view_dates` history tables

---

#### Task 1.5 — SQLite repository implementation ✅

File: `pkg/sqlite/audio.go` (~1,067 lines)

Implemented: full CRUD, Find/FindMany, FindByChecksum, FindByFingerprints, FindByFileID, Query/QueryCount, all relationship loaders, cover blob helpers (GetCover, HasCover, UpdateCover, destroyCover). Wired into `pkg/sqlite/database.go`.

**Gap — see Task 1.1 note about PlayCount/LastPlayedAt field mappings.**

---

#### Task 1.6 — Fix PlayCount/LastPlayedAt field mappings (NEW)

The DB migration has `play_count`, `last_played_at` columns and the sort handler supports them, but the Go model and SQLite row structs don't map them. This creates a runtime mismatch.

Files to update:
- `pkg/models/model_audio.go` — add `PlayCount int` and `LastPlayedAt *time.Time` to `Audio`; add to `AudioPartial`
- `pkg/sqlite/audio.go` — add fields to `audioRow`, `fromAudio()`, `resolve()`, `fromPartial()`

---

### Phase 2 — File Scanning & Library Integration ✅ COMPLETE

#### Task 2.1 — Audio file decorator ✅

File: `pkg/file/audio/scan.go`

Implemented: ffprobe-based metadata extraction for audio files (duration, codec, format, bitrate, sample rate, channels).

---

#### Task 2.2 — Configuration ✅ (partially)

Constants `AudioExtensions` and `AudioExclude` added to `internal/manager/config/config.go` with getter methods.

**Remaining work (moved to Task 6.1):**
- GraphQL config schema updates (`config.graphql`) not yet done
- Config resolver updates not yet done
- These are deferred to Phase 6 (Settings UI) since they're needed for the settings panel

---

#### Task 2.3 — Scanner pipeline integration ✅

Audio decorator and `ScanHandler` wired into `internal/manager/task_scan.go`. The handler (`pkg/audio/scan.go`) creates new `Audio` records for new files and associates existing ones by fingerprint match.

---

#### ~~Task 2.4 — File identification and fingerprinting~~ ✅ REMOVED

This was a no-op. MD5 fingerprinting is handled generically by the base scanner. `FindByChecksum` and `FindByFingerprints` are implemented in the audio store. No audio-specific fingerprinting work needed.

---

### Phase 3 — GraphQL API

#### Task 3.0 — Implement audio filter criteria (`pkg/sqlite/audio_filter.go`) (NEW)

The `audioFilterHandler` struct and validation logic exist but the `handle()` method has a `TODO: implement audio-specific filter criteria` stub. The Go-side `AudioFilterType` (in `pkg/models/audio.go`) is fully defined with comprehensive criteria (Title, Details, Path, Checksum, Rating, Duration, Bitrate, AudioCodec, Tags, Performers, Studios, PlayCount, PlayDuration, LastPlayedAt, etc.).

Implement all filter criteria handlers in `audioFilterHandler.handle()`, following `pkg/sqlite/scene_filter.go` as a template. This includes:
- String filters: title, details, path, checksum, audio_codec, url
- Int filters: rating100, o_counter, duration, bitrate, file_count, tag_count, performer_count, play_count, play_duration, resume_time
- Boolean filters: organized
- Hierarchical filters: studios, tags, performer_tags
- Multi-criterion filters: performers, stash_id_endpoint
- Timestamp filters: created_at, updated_at, last_played_at
- Date filters: date
- Special filters: has_markers, is_missing, performer_favorite
- Sub-entity filters: performers_filter, studios_filter, tags_filter, files_filter

This is required before the GraphQL API can support queries with filters.

---

#### Task 3.1 — GraphQL schema: types and filters (`graphql/schema/types/audio.graphql`)

Define:

```graphql
type Audio {
  id: ID!
  title: String
  details: String
  date: String
  rating100: Int
  o_counter: Int!
  organized: Boolean!
  play_count: Int!
  play_duration: Float!
  resume_time: Float!
  last_played_at: Time
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

  id:              IntCriterionInput
  title:           StringCriterionInput
  details:         StringCriterionInput
  path:            StringCriterionInput
  checksum:        StringCriterionInput
  file_count:      IntCriterionInput
  rating100:       IntCriterionInput
  organized:       Boolean
  o_counter:       IntCriterionInput
  bitrate:         IntCriterionInput
  audio_codec:     StringCriterionInput
  duration:        IntCriterionInput
  has_markers:     String
  is_missing:      String          # "studio", "tags", "performers", "cover_image"
  studios:         HierarchicalMultiCriterionInput
  tags:            HierarchicalMultiCriterionInput
  tag_count:       IntCriterionInput
  performer_tags:  HierarchicalMultiCriterionInput
  performer_favorite: Boolean
  performers:      MultiCriterionInput
  performer_count: IntCriterionInput
  stash_id:        StringCriterionInput
  stash_id_endpoint: StashIDCriterionInput
  url:             StringCriterionInput
  resume_time:     IntCriterionInput
  play_count:      IntCriterionInput
  play_duration:   IntCriterionInput
  last_played_at:  TimestampCriterionInput
  date:            DateCriterionInput
  performers_filter: PerformerFilterType
  studios_filter:  StudioFilterType
  tags_filter:     TagFilterType
  files_filter:    FileFilterType
  created_at:      TimestampCriterionInput
  updated_at:      TimestampCriterionInput
}

enum AudioSortEnum {
  title
  date
  rating
  o_counter
  duration
  bitrate
  play_count
  last_played_at
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
  primary_tag: Tag!
  tags: [Tag!]!
  audio: Audio!
  created_at: Time!
  updated_at: Time!
}
```

Note: Unlike `SceneMarker`, `AudioMarker` has no `screenshot` or `preview` fields since there are no video frames to capture.

Add CRUD mutations: `audioMarkerCreate`, `audioMarkerUpdate`, `audioMarkerDestroy`.

---

#### Task 3.3 — Go GraphQL resolvers (`internal/api/`)

Create three resolver files following existing scene resolver patterns:

**`resolver_model_audio.go`** — field resolvers for `Audio` type:
- `Studio`, `Tags`, `Performers`, `URLs`, `StashIDs`, `Files`, `Paths`
- `PlayCount`, `PlayDuration`, `ResumeTime`, `LastPlayedAt`, `OCounter`

**`resolver_query_find_audio.go`** — query implementations:
- `FindAudio`, `FindAudios`, `FindAudiosByPathRegex`

**`resolver_mutation_audio.go`** — mutation implementations:
- `AudioCreate`, `AudioUpdate`, `AudiosUpdate`, `BulkAudioUpdate`
- `AudioDestroy`, `AudiosDestroy`
- `AudioIncrementO`, `AudioDecrementO`, `AudioResetO`
- `AudioIncrementPlayCount`, `AudioDecrementPlayCount`
- `AudioSaveActivity` (save resume_time and play_duration, following `sceneSaveActivity`)
- `AssignAudioFile`

Wire into `internal/api/resolver.go`.

**Note:** Also need to run `go generate` to regenerate the GraphQL bindings after adding the schema files.

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

#### Task 4.3 — Cover art storage and retrieval (partially complete)

Cover art is stored via the `blobs` table (referenced by `cover_blob` column in `audios`). SQLite store methods are already implemented:
- ✅ `GetCover(ctx, audioID)` — implemented
- ✅ `HasCover(ctx, audioID)` — implemented
- ✅ `UpdateCover(ctx, audioID, image)` — implemented
- ✅ `destroyCover(ctx, audioID)` — implemented

Remaining work:
- Serve cover art via the `/audio/{audioId}/screenshot` HTTP route (in Task 4.2)
- Accept base64-encoded cover art in GraphQL `AudioCreateInput.cover_image` / `AudioUpdateInput.cover_image` (in Task 3.3)

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

**Backend (deferred from Task 2.2):**
The Go config constants and getter methods exist (`AudioExtensions`, `AudioExclude`), but the GraphQL config schema has not been updated. This must be done first:
- Add `audioExtensions: [String!]!` and `excludedAudioPatterns: [String!]!` to `ConfigLibraryResult` in `graphql/schema/types/config.graphql`
- Add same fields to `ConfigLibraryInput`
- Update config resolvers in `internal/api/resolver_config.go`

**Frontend:**
Update `ui/v2.5/src/components/Settings/SettingsLibraryPanel.tsx` (or equivalent):

- Add `audioExtensions` field (multi-value text input, seeded with defaults).
- Add `excludedAudioPatterns` field (multi-value text input).
- Add `excludeAudio: Boolean` toggle per stash library (in the stash config section), following `excludeVideo` / `excludeImage`.

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
Phase 1 ✅  →  Phase 2 ✅  →  Phase 3      →  Phase 4      →  Phase 5      →  Phase 6      →  Phase 7
Data model     Scanning       GraphQL API     Streaming       Frontend        Settings        Autotag
```

**Current status:** Phases 1–2 complete. Next priority: fix PlayCount/LastPlayedAt gap (Task 1.6), then implement filter criteria (Task 3.0), then proceed with GraphQL schema and resolvers (Tasks 3.1–3.4).

Each phase depends on the previous, but within a phase tasks can often be parallelised. The backend (Phases 1–4) must be complete before the frontend (Phase 5) can be wired to real data, but frontend components can be scaffolded with mock data in parallel.

---

## Key Files to Reference

| Purpose | Path |
|---|---|
| Scene model (template) | `pkg/models/model_scene.go` |
| Scene SQLite store | `pkg/sqlite/scene.go` |
| Scene filter (template for Task 3.0) | `pkg/sqlite/scene_filter.go` |
| Video file decorator | `pkg/file/video/scan.go` |
| Config extensions | `internal/manager/config/config.go` |
| Scene GraphQL schema | `graphql/schema/types/scene.graphql` |
| Scene marker schema | `graphql/schema/types/scene-marker.graphql` |
| Scene stream manager | `internal/manager/scene.go` |
| Scene HTTP routes | `internal/api/routes_scene.go` |
| Scene React list | `ui/v2.5/src/components/Scenes/SceneList.tsx` |
| Scene React detail | `ui/v2.5/src/components/Scenes/SceneDetails/Scene.tsx` |
| Scene GQL fragments | `ui/v2.5/graphql/data/scene.graphql` |
| **Audio model (implemented)** | `pkg/models/model_audio.go` |
| **Audio filter type (implemented)** | `pkg/models/audio.go` |
| **Audio SQLite store (implemented)** | `pkg/sqlite/audio.go` |
| **Audio filter handler (stub)** | `pkg/sqlite/audio_filter.go` |
| **Audio file decorator (implemented)** | `pkg/file/audio/scan.go` |
| **Audio scan handler (implemented)** | `pkg/audio/scan.go` |
| **Audio DB migration** | `pkg/sqlite/migrations/85_audios.up.sql` |
