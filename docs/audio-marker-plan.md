# Audio Marker Implementation Plan

Audio markers are timed annotations within an audio file (analogous to `SceneMarker` for scenes). This plan covers implementing the full marker feature after the core Audio CRUD API is complete.

## Prerequisites

- Audio CRUD API complete (Tasks 3.1–3.3 done) ✅
- HTTP routes for audio streaming live (Task 4.2)

## Why Deferred

Markers were excluded from the initial release to avoid shipping partially-implemented UI (no screenshot/preview, marker wall, etc.) and to keep the initial audio API surface small. The `AudioMarker` Go model (`pkg/models/model_audio_marker.go`) and DB tables (`audio_markers`, `audio_markers_tags`) are already in place.

---

## Task M.1 — SQLite store (`pkg/sqlite/audio_marker.go`)

Follow `pkg/sqlite/scene_marker.go` as the reference.

```
type AudioMarkerStore struct {
    repository
    tagsRepository joinsRepository[audioMarkerRow]
}
```

Implement:
- `Create(ctx, marker, tagIDs)` / `Update(ctx, marker)` / `Destroy(ctx, id)`
- `Find(ctx, id)` / `FindMany(ctx, ids)` / `FindByAudioID(ctx, audioID)`
- `GetTagIDs(ctx, markerID)` — for join table `audio_markers_tags`
- `Wall(ctx, q)` — random markers (for a marker wall feature)
- `Query(ctx, AudioMarkerQueryOptions)` / `Count(ctx, AudioMarkerFilterType)`

Wire into `pkg/sqlite/database.go`: add `AudioMarker AudioMarkerReaderWriter` to the Repository and initialize in `NewDatabase()`.

## Task M.2 — Repository interfaces (`pkg/models/repository_audio_marker.go`)

```go
type AudioMarkerReader interface {
    Find(ctx context.Context, id int) (*AudioMarker, error)
    FindMany(ctx context.Context, ids []int) ([]*AudioMarker, error)
    FindByAudioID(ctx context.Context, audioID int) ([]*AudioMarker, error)
    GetTagIDs(ctx context.Context, markerID int) ([]int, error)
    Wall(ctx context.Context, q *string) ([]*AudioMarker, error)
    Query(ctx context.Context, options AudioMarkerQueryOptions) (*AudioMarkerQueryResult, error)
}

type AudioMarkerWriter interface {
    Create(ctx context.Context, marker *AudioMarker, tagIDs []int) error
    Update(ctx context.Context, marker *AudioMarker) error
    Destroy(ctx context.Context, id int) error
}

type AudioMarkerReaderWriter interface {
    AudioMarkerReader
    AudioMarkerWriter
}
```

## Task M.3 — GraphQL schema (`graphql/schema/types/audio-marker.graphql`)

Re-add the schema file removed in Task 3.1:

```graphql
type AudioMarker {
  id: ID!
  audio: Audio!
  title: String!
  seconds: Float!
  end_seconds: Float
  primary_tag: Tag!
  tags: [Tag!]!
  created_at: Time!
  updated_at: Time!
  stream: String! # Resolver — URL to stream from this timestamp
}

input AudioMarkerCreateInput { ... }
input AudioMarkerUpdateInput { ... }
input AudioMarkerFilterType { ... }
type FindAudioMarkersResultType { count: Int!, audio_markers: [AudioMarker!]! }
```

Add to `schema.graphql`:
```graphql
# Queries
findAudioMarkers(audio_marker_filter: AudioMarkerFilterType, filter: FindFilterType): FindAudioMarkersResultType!

# Mutations
audioMarkerCreate(input: AudioMarkerCreateInput!): AudioMarker
audioMarkerUpdate(input: AudioMarkerUpdateInput!): AudioMarker
audioMarkerDestroy(id: ID!): Boolean!
```

## Task M.4 — Go resolvers

Restore the removed resolver code:

**`resolver_model_audio.go`** — AudioMarker field resolvers:
- `Audio(ctx, obj)` — load via `r.repository.Audio.Find(obj.AudioID)`
- `PrimaryTag(ctx, obj)` — load via `loaders.TagByID`
- `Tags(ctx, obj)` — load via `r.repository.AudioMarker.GetTagIDs` + `loaders.TagByID`
- `Stream(ctx, obj)` — `/audio/{audioID}/stream?t={seconds}`

Re-wire `AudioMarker() AudioMarkerResolver` in `resolver.go`.

**`resolver_query_find_audio.go`** — restore `FindAudioMarkers`.

**`resolver_mutation_audio.go`** — restore `AudioMarkerCreate`, `AudioMarkerUpdate`, `AudioMarkerDestroy`.

## Task M.5 — HTTP stream-at-timestamp route

For the `AudioMarker.stream` path, extend the audio stream route to support a `t` query parameter:

```
GET /audio/{audioId}/stream?t=30.5   — stream starting at 30.5s
```

This requires the streaming route to seek to the given time offset (pass `-ss {seconds}` before input to ffmpeg, or use the HTTP byte-range + duration approach for pre-encoded files).

## Task M.6 — React frontend

Add audio marker UI following the scene marker pattern:
- `ui/v2.5/graphql/data/audio-marker.graphql` — fragment
- `ui/v2.5/graphql/mutations/audio-marker.graphql` — CRUD mutations
- Marker timeline on the audio detail page
- Marker wall (optional, lower priority)

---

## Differences from SceneMarker

| Feature | SceneMarker | AudioMarker |
|---|---|---|
| `screenshot` | Yes (video frame) | No |
| `preview` | Yes (clip) | No |
| `stream` | Clip from scene | Seek offset in audio stream |
| Wall | Yes | Optional (lower priority) |
| WebVTT | Via `/scene/{id}/vtt/chapter` | Via `/audio/{id}/vtt/chapter` |
