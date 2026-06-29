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
- Streaming is direct file serve (browsers natively handle MP3, FLAC, OGG, AAC, WAV via `<audio>`)

Reference models: `Scene` (primary) and `Image` (for cover art pattern).

---

## Cross-cutting: Unit Tests

Every Go task should include unit tests consistent with `pkg/audio/scan_test.go` (testify/mock, table-driven). The frontend has no test infrastructure (no Jest/Vitest), so no frontend tests are expected.

---

## Architecture Reference

| Layer | Scene example | Audio equivalent |
|---|---|---|
| Go model | `pkg/models/model_scene.go` | `pkg/models/model_audio.go` |
| Repository interface | `pkg/models/repository_scene.go` | `pkg/models/repository_audio.go` |
| DB migration | `pkg/sqlite/migrations/1_initial.up.sql` | `pkg/sqlite/migrations/85_audios.up.sql` |
| SQLite CRUD | `pkg/sqlite/scene.go` | `pkg/sqlite/audio.go` |
| File decorator | `pkg/file/video/scan.go` | `pkg/file/audio/scan.go` |
| Routes | `internal/api/routes_scene.go` | `internal/api/routes_audio.go` |
| GraphQL schema | `graphql/schema/types/scene.graphql` | `graphql/schema/types/audio.graphql` |
| GQL resolvers | `internal/api/resolver_{model,query,mutation}_scene.go` | `internal/api/resolver_{model,query,mutation}_audio.go` |
| GQL client fragments | `ui/v2.5/graphql/data/scene.graphql` | `ui/v2.5/graphql/data/audio-slim.graphql` |
| GQL client queries | `ui/v2.5/graphql/queries/scene.graphql` | `ui/v2.5/graphql/queries/audio.graphql` |
| GQL client mutations | `ui/v2.5/graphql/mutations/scene.graphql` | `ui/v2.5/graphql/mutations/audio.graphql` |
| React routes | `ui/v2.5/src/components/Scenes/` | `ui/v2.5/src/components/Audios/` |

---

## Task List

### Phase 1 — Data Model & Database ✅ COMPLETE

#### Task 1.1 — Go data model ✅

File: `pkg/models/model_audio.go`

`Audio` struct, `AudioPartial`, `NewAudio()`, `NewAudioPartial()`, all `LoadRelationships` methods. Fields include `ResumeTime`, `PlayDuration`, `PlayCount`, `LastPlayedAt`.

---

#### Task 1.2 — Audio file metadata type ✅

`AudioFile` type in `pkg/models/model_file.go`. Fields: `Duration`, `AudioCodec`, `Format`, `BitRate`, `SampleRate`, `Channels`.

---

#### Task 1.3 — Repository interfaces ✅

File: `pkg/models/repository_audio.go`

All interfaces defined: `AudioGetter`, `AudioFinder`, `AudioQueryer`, `AudioCounter`, `AudioCreator`, `AudioUpdater`, `AudioDestroyer`, `AudioReader`, `AudioWriter`.

---

#### Task 1.4 — Database migration ✅

File: `pkg/sqlite/migrations/85_audios.up.sql`

Tables: `audios`, `audio_files`, `audios_files`, `audio_urls`, `performers_audios`, `audios_tags`, `audio_stash_ids`, `audio_o_dates`, `audio_view_dates`, `audio_markers`, `audio_markers_tags`. Uses `cover_blob` referencing the `blobs` table.

---

#### Task 1.5 — SQLite repository implementation ✅

File: `pkg/sqlite/audio.go`

Full CRUD, Find/FindMany, FindByChecksum, FindByFingerprints, FindByFileID, Query/QueryCount, all relationship loaders, cover blob helpers (`GetCover`, `HasCover`, `UpdateCover`, `destroyCover`). Wired into `pkg/sqlite/database.go`.

---

#### Task 1.6 — Fix PlayCount/LastPlayedAt field mappings ✅

`PlayCount` and `LastPlayedAt` added to `Audio`, `AudioPartial`, `audioRow`, `fromAudio()`, `resolve()`, and `fromPartial()`. Regression guard test added in `pkg/audio/scan_test.go`.

---

### Phase 2 — File Scanning & Library Integration ✅ COMPLETE

#### Task 2.1 — Audio file decorator ✅

File: `pkg/file/audio/scan.go`

ffprobe-based metadata extraction for audio files (duration, codec, format, bitrate, sample rate, channels).

---

#### Task 2.2 — Configuration ✅

Config constants `AudioExtensions` and `AudioExclude` in `internal/manager/config/config.go`. GraphQL config schema and resolver updates done in Phase 6.

---

#### Task 2.3 — Scanner pipeline integration ✅

Audio decorator and `ScanHandler` wired into `internal/manager/task_scan.go`. Creates new `Audio` records for new files; associates existing ones by fingerprint match.

---

#### Task 2.4 — ~~File identification and fingerprinting~~ ✅ REMOVED

No-op. MD5 fingerprinting is handled generically by the base scanner.

---

#### Task 2.5 — Embedded cover art extraction during scan ✅

Files: `pkg/ffmpeg/cover.go`, `pkg/audio/scan.go`

`FFMpeg.ExtractEmbeddedCover()` extracts the attached picture stream (`-map 0:v -c copy -f image2 pipe:1`). `ScanHandler` has a `CoverUpdater` interface and calls `extractCoverIfMissing()` on new audio creation and new file association. Errors are logged, never fatal. `ScanHandler` wired with `CoverUpdater` and `FFMpeg` in `task_scan.go`. Unit tests in `pkg/audio/scan_test.go`; table-driven tests for `HasEmbeddedCover` in `pkg/ffmpeg/ffprobe_test.go`.

---

### Phase 3 — GraphQL API ✅ COMPLETE (except Task 3.4)

#### Task 3.0 — Audio filter criteria (`pkg/sqlite/audio_filter.go`) ✅

Full `audioFilterHandler.handle()` implementation covering all filter criteria: string, int, boolean, hierarchical, multi-criterion, timestamp, date, has_markers, is_missing, performer_favorite, sub-entity filters.

---

#### Task 3.1 — GraphQL schema: types and filters ✅

File: `graphql/schema/types/audio.graphql`

`Audio`, `AudioPathsType`, `FindAudiosResultType`, `AudioCreateInput`, `AudioUpdateInput`, `BulkAudioUpdateInput`, `AudioDestroyInput`, `AudiosDestroyInput`, `AssignAudioFileInput`, `AudioFilterType`. Paths use `cover` (not `screenshot`) since there are no video frames.

---

#### Task 3.2 — Audio markers schema ✅

File: `graphql/schema/types/audio-marker.graphql`

`AudioMarker` type defined. CRUD mutations stubbed. No `screenshot` or `preview` fields (audio has no video frames).

---

#### Task 3.3 — Go GraphQL resolvers ✅

Files: `internal/api/resolver_model_audio.go`, `resolver_query_find_audio.go`, `resolver_mutation_audio.go`

Full CRUD, o-counter, play count, `AudioSaveActivity`, `AssignAudioFile`. Wired into `internal/api/resolver.go`.

---

#### Task 3.4 — Audio marker resolvers ⏸ DEFERRED

Requires a full SQLite store for audio markers (following `pkg/sqlite/scene_marker.go`) and wired resolvers for `FindAudioMarkers`, `AudioMarkerCreate/Update/Destroy`. This is deferred until after the core audio experience is complete, as markers are a secondary feature.

---

### Phase 4 — Streaming & HTTP Routes

#### Task 4.1 — HLS audio streaming manager 🔭 STRETCH GOAL

HLS remux for audio (extract audio track into AAC/HLS segments, following `internal/manager/scene.go`). Deferred: browsers natively handle all common audio formats via `<audio>`, so HLS adds complexity without a clear benefit for typical use. Revisit if gapless playback or adaptive bitrate becomes a real requirement.

---

#### Task 4.2 — HTTP routes for audio (`internal/api/routes_audio.go`) ✅

```
GET /audio/{audioId}/stream      — direct file serve via file.OsFS
GET /audio/{audioId}/cover       — cover art blob or default SVG fallback
GET /audio/{audioId}/vtt/chapter — WebVTT stub (empty, ready for markers)
```

`AudioCtx` middleware looks up audio by numeric ID or checksum, loads primary file. Registered in `internal/api/server.go`. Default cover SVG embedded via `//go:embed` in `internal/static/embed.go`.

---

#### Task 4.3 — Cover art storage and retrieval ✅

`GetCover`/`HasCover`/`UpdateCover`/`destroyCover` implemented in `pkg/sqlite/audio.go`. Cover served via `/audio/{id}/cover` route. Base64-encoded `cover_image` accepted in `AudioCreateInput`/`AudioUpdateInput` resolvers.

---

### Phase 5 — React Frontend

#### Phase 5a — Audio list page ✅ COMPLETE

- `FilterMode.AUDIOS` added to GraphQL schema, Go model constants, and TypeScript generated types
- `ui/v2.5/graphql/data/audio-slim.graphql` — `SlimAudioData` fragment
- `ui/v2.5/graphql/data/file.graphql` — `AudioFileData` fragment added
- `ui/v2.5/graphql/queries/audio.graphql` — `FindAudios`, `FindAudiosMetadata`, `FindAudio`
- `useFindAudios`, `useFindAudiosMetadata`, `queryFindAudios`, `useFindAudio` in `StashService.ts`
- `src/models/list-filter/audios.ts` — `AudioListFilterOptions`
- `src/models/list-filter/factory.ts` — `FilterMode.Audios` case
- `src/components/List/views.ts` — `View.Audios`
- `src/components/List/EditFilterDialog.tsx` — `FilterModeToConfigKey` entry
- `src/components/FrontPage/FrontPageConfig.tsx` — `FilterModeToMessageID` entry
- `src/components/Audios/AudioCard.tsx` — GridCard-based card with cover, duration, codec, tag/performer popovers
- `src/components/Audios/AudioCardGrid.tsx` — responsive grid
- `src/components/Audios/AudioList.tsx` — `FilteredAudioList` with sidebar, pagination, zoom, "view random"
- `src/components/Audios/Audios.tsx` — route wrapper with `<Helmet>`
- `MainNavbar.tsx` — "audios" menu item (faMusic, hotkey `g a`)
- `App.tsx` — lazy import + `/audios` route
- `en-GB.json` — `"audios"` key

Codegen: `make generate` (or `pnpm run gqlgen` from `ui/v2.5/`)

---

#### Phase 5b — Audio detail page ✅ COMPLETE

Files: `src/components/Audios/AudioDetails/`

- `Audio.tsx` — `AudioLoader` (route, data fetch) + `AudioPage` (tabs/toolbar). Two-column layout matching Scene: tabs on left, player on right. Tabs: Details, File Info. Toolbar: rating, play count, o-counter, organized, operations (delete). Hotkeys: `a` details, `i` file info, `o` o-counter.
- `AudioDetailPanel.tsx` — created_at, updated_at, details text, tags, performer cards.
- `AudioFileInfoPanel.tsx` — stream URL, stash IDs, URLs, md5, path, size, mod_time, duration, bitrate, audio_codec.
- `AudioPlayer.tsx` — cover art `<img>` + native `<audio controls>` with resume_time restore and VTT chapter track.
- `DeleteAudiosDialog.tsx` — delete confirmation modal with delete-file and delete-generated options.
- `Audios.tsx` — `/audios/:id` route added.
- `ui/v2.5/graphql/data/audio.graphql` — full `AudioData` fragment (incl. details, urls, stash_ids, resume_time, play_duration, PerformerData).
- `ui/v2.5/graphql/mutations/audio.graphql` — AudioUpdate, AudioIncrementO/DecrementO/ResetO, AudioSaveActivity, AudioIncrementPlayCount, AudioDestroy, AudiosDestroy, AudioAssignFile.
- StashService hooks: `useAudioUpdate`, `useAudioIncrementO`, `useAudioDecrementO`, `useAudioIncrementPlayCount`, `useAudioSaveActivity`, `useAudioDestroy`, `useAudiosDestroy`.

---

#### Phase 5c — Edit panel, bulk dialogs, mutations

- `AudioEditPanel.tsx` — inline edit form (title, date, studio, performers, tags, rating, URLs, cover image upload)
- `EditAudiosDialog.tsx` — bulk edit: rating, studio, tags, performers, organized
- `DeleteAudiosDialog.tsx` — bulk delete with optional file deletion
- `ui/v2.5/graphql/mutations/audio.graphql` — all mutations wired up
- Wire edit/delete operations into `FilteredAudioList` toolbar

Pattern: `EditScenesDialog.tsx`, `DeleteScenesDialog.tsx`, `SceneEditPanel.tsx`.

---

### Phase 6 — Settings UI ✅ COMPLETE

#### Task 6.1 — Library settings for audio ✅

- `audioExtensions` and `audioExcludes` added to `ConfigGeneralInput`/`ConfigGeneralResult` in `graphql/schema/types/config.graphql`
- `excludeAudio` added to `StashConfigInput`/`StashConfig` in `internal/manager/config/stash_config.go`
- Config resolvers updated in `internal/api/resolver_query_configuration.go` and `resolver_mutation_configure.go`
- Frontend: `SettingsLibraryPanel.tsx` — audio extensions and excludes inputs; `StashConfiguration.tsx` — per-stash `excludeAudio` toggle
- Locale strings added to `en-GB.json`

---

### Phase 7 — Auto-tagging & Scrapers

#### Task 7.1 — Auto-tag support for audio

Extend `internal/autotag/` to support `Audio`: `AudioTagger` following `SceneTagger` — match performers, studios, tags from filename/path. Register in the auto-tag task manager.

---

#### Task 7.2 — Scraper support for audio (stretch goal)

Extend the scraper framework (`internal/scraper/`) to support an `AudioScraped` type for pulling metadata from external sources. Large task, deferred to a follow-up.

---

## Build Order Summary

```
Phase 1 ✅  →  Phase 2 ✅  →  Phase 3 ✅  →  Phase 4 ✅  →  Phase 5      →  Phase 6 ✅  →  Phase 7
Data model     Scanning       GraphQL API     Routes          Frontend        Settings        Autotag
                                                              5a ✅ 5b  5c
```

**Current status:** Phases 1–4 and 6 complete. Phases 5a and 5b complete. Next: Phase 5c (edit panel, bulk dialogs).

---

## Key Files to Reference

| Purpose | Path |
|---|---|
| Scene model (template) | `pkg/models/model_scene.go` |
| Scene SQLite store | `pkg/sqlite/scene.go` |
| Scene filter (template) | `pkg/sqlite/scene_filter.go` |
| Video file decorator | `pkg/file/video/scan.go` |
| Config extensions | `internal/manager/config/config.go` |
| Scene GraphQL schema | `graphql/schema/types/scene.graphql` |
| Scene marker schema | `graphql/schema/types/scene-marker.graphql` |
| Scene HTTP routes | `internal/api/routes_scene.go` |
| Scene React list | `ui/v2.5/src/components/Scenes/SceneList.tsx` |
| Scene React detail | `ui/v2.5/src/components/Scenes/SceneDetails/Scene.tsx` |
| Scene GQL fragments | `ui/v2.5/graphql/data/scene.graphql` |
| **Audio model** | `pkg/models/model_audio.go` |
| **Audio filter type** | `pkg/models/audio.go` |
| **Audio SQLite store** | `pkg/sqlite/audio.go` |
| **Audio filter handler** | `pkg/sqlite/audio_filter.go` |
| **Audio file decorator** | `pkg/file/audio/scan.go` |
| **Audio scan handler** | `pkg/audio/scan.go` |
| **Audio DB migration** | `pkg/sqlite/migrations/85_audios.up.sql` |
| **Audio HTTP routes** | `internal/api/routes_audio.go` |
| **Audio React components** | `ui/v2.5/src/components/Audios/` |
