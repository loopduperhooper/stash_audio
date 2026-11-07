# stash_audio

A fork of [Stash](https://github.com/stashapp/stash) stripped down to audio-only — no video, images, or galleries. Built for organizing and playing audio collections (podcasts, lectures, music, etc.) with full tagging, performer/studio metadata, group organization, and auto-tagging.

## What's different from Stash

- **Audio only** — scenes, images, and galleries are removed from the UI and backend
- **Audio player** — in-page playback with a full-panel waveform display
- **Funscript sync** — optional haptic device sync via buttplug.io (Linear devices)
- **Auto-tag** — tags, performers, and studios are applied based on filename/path matching
- **Cover art** — extracted from embedded metadata or sidecar image files (cover.jpg, folder.png, etc.)
- **Groups** — organize audios into albums or collections
- **Tag detail page** — includes an Audios tab showing all audios with that tag

## Building from source

Requirements: Go 1.21+, Node.js 18+, pnpm, ffmpeg

```bash
# Clone
git clone https://github.com/loopduperhooper/stash_audio.git
cd stash_audio

# Build frontend
cd ui/v2.5
pnpm install
node node_modules/vite/bin/vite.js build
cd ../..

# Build binary (embeds the frontend)
go build -o stash_audio ./cmd/stash_audio/
```

## Running

```bash
./stash_audio --port 9999
```

Then open `http://localhost:9999` in your browser.

On first run you'll be prompted to set a media directory. Point it at your audio folder and run a scan — stash_audio will index all supported audio files (mp3, flac, ogg, m4a, wav, aac, opus, etc.).

## ffmpeg

ffmpeg is required for cover art extraction. Install it from your distro's package manager or download it from [ffmpeg.org](https://ffmpeg.org/download.html).

## Auto-tagging

Create a tag (or performer/studio) whose name matches part of a filename or path, then run **Auto Tag** from the tag's detail page or from Settings → Metadata. stash_audio will match files using word-boundary regex and apply the tag automatically.

## Audio playback queue

Audio cards and detail pages offer **Play**, **Play next**, and **Add to queue**.
Play starts that track and clears the previous queue. Play next inserts at the
front of the queue; Add to queue appends without interrupting playback. Adding
tracks while idle does not start playback; choose **Start queue** in the player.

The bottom player stays mounted while browsing. **View player** opens a full-window
view of the current track's cover, motion controls and upcoming tracks. Choose
**Minimize player** or press Escape to return to the compact player. Move queued tracks earlier or
later, remove individual entries, or clear the upcoming queue. **Close player**
stops audio and clears the whole session.

Both **Next** and the natural end of a track consume the explicit queue first.
When empty, playback continues with the next audio in the current track's group,
in the same order displayed on that group's page. At the last item, or with no
group, Next is disabled and playback stops at the end. After a queued track from
another group, continuation uses that track's group. Group remainders are never
automatically added to the queue. Group-page actions retain that group context;
otherwise, multiple memberships use a random group chosen once per playback entry.

The queue, current track, group context and position are saved in this browser.
Refresh restores playback paused. Ordinary Play uses the track's resume position;
queued tracks and group continuation start at zero. Track switches replace the
script and reset algorithm selection while retaining the Intiface connection and
Stop / Resume updates state. If the browser blocks automatic playback, the player
shows a prompt to use the native Play control.

Queue and source-transition checks (Node.js 22.18+):

```bash
node scripts/tests/audio-queue.test.mjs
node scripts/tests/audio-playback.test.mjs
```

## Device update shortcut

While connected to Intiface, press **Page Down** or click **Stop updates** to
suspend funscript commands while audio keeps playing. Press again or click
**Resume updates** to sync at the current playback position. The connection stays
open; a movement already sent to the device may finish.

Change the shortcut in **Device sync → Stop / resume updates shortcut** by focusing
the field and pressing a key combination. The binding is saved in this browser.
Shortcuts are ignored in editable fields, and holding the key toggles only once.
Suspension lasts across track changes until resumed; refreshing starts a new
session with updates allowed.

Device sync settings also include a **Scheduler interval** (default 20 ms) and
**Script offset** (default 0 ms), saved in this browser. Positive offset runs the
script ahead of audio; negative delays it. The scheduler targets upcoming script
points using the remaining playback time and playback speed. It sends each target
once, suspends updates during pause/buffering/seeking, and skips obsolete points
after delayed callbacks. Interpolation remains linear; browser timer throttling
can still affect timing, especially in background tabs.

Scheduler checks can be run with Node.js 22.18+:

```bash
node scripts/tests/funscript-scheduler.test.mjs
```

## Generated motion algorithms

The audio player's **Motion source** selector defaults to **Use track script**.
When a track has no script, motion stays off until you choose an algorithm.
Algorithms can also override an existing script; choose **Use track script** to
restore it. Source selection resets on track changes and refresh.

**60 BPM strokes** performs one full 0% → 100% → 0% cycle per second at normal
playback speed, with linear half-strokes of 500 ms. Phase starts at media time
zero. Seeking, playback speed, script offset and Stop / Resume updates work with
generated motion through the same scheduler as track scripts.

### T&D_v1 state machine

**T&D_v1** starts in mode 1 and uses the following states:

| Mode | Motion | Duration/count | Next mode |
| --- | --- | --- | --- |
| 1 | Hold a random partial position (1–99%) | 5–15 seconds at that position | Random choice of 2, 3 or 4 |
| 2 | Alternate full strokes between 0% and 100% | 3–7 seconds per movement; 1–30 movements, favoring shorter runs | 1 |
| 3 | Accelerating full strokes between 0% and 100% | Five movements over 15–20 seconds; movement durations decrease linearly from 5–7 seconds to exactly 1 second | 5 |
| 4 | Alternate half strokes between 50% and 100% | 2–4 seconds per movement; 1–30 movements, favoring shorter runs | 1 |
| 5 | Hold at exactly 0% | 10–15 seconds at zero | Random choice of 2, 3 or 4 |

A movement is one direction, rather than an out-and-back cycle. When needed,
a one-second approach reaches the hold position or a stroke-range endpoint before
the state's timed hold or movement sequence begins. Acceleration decreases the
duration evenly per movement, with the five durations summing to the chosen
window. All times are at normal playback speed.

Each playback entry receives a fresh random seed. Pausing, resuming, seeking,
and switching motion sources within that entry preserve the seed, so returning
to the same media timestamp produces the same motion. Playing the track again,
advancing to another queue entry, or refreshing creates a new seed. The implementation is
[`tdV1.ts`](ui/v2.5/src/motion/tdV1.ts). State and generator checks (Node.js 22.18+):

```bash
node scripts/tests/td-v1.test.mjs
```

### Defining a new algorithm

Algorithms are **TypeScript** modules compiled into the frontend and run locally
in the browser. They are repository code, rather than uploaded scripts or backend
plugins; adding one requires rebuilding the frontend (and the binary if it embeds
the frontend). They do not create or modify track files.

1. Create a module under [`ui/v2.5/src/motion/`](ui/v2.5/src/motion/).
2. Export an object implementing
   [`MotionAlgorithm`](ui/v2.5/src/motion/types.ts).
3. Import it and add it to `motionAlgorithms` in
   [`ui/v2.5/src/motion/index.ts`](ui/v2.5/src/motion/index.ts).
4. Rebuild using the instructions above. The algorithm's name appears in the
   player's **Motion source** selector.

The interface is:

```ts
interface MotionAlgorithm {
  id: string;
  name: string;
  description: string;
  generate: (timeMs: number) => readonly { at: number; pos: number }[];
  createGenerator?: (seed: number) => MotionAlgorithm["generate"];
}
```

| Field | Contract |
| --- | --- |
| `id` | Stable, unique identifier; avoid `track`, which selects the track's script. |
| `name` | Label shown in the source selector. |
| `description` | Help text shown when selected. |
| `createGenerator(seed)` | Optional factory for randomized algorithms; the player supplies a fresh seed per playback entry. Return a generator that reuses this seed for every call. |
| `generate(timeMs)` | Pure, deterministic function returning a small window of motion points for the supplied absolute media time. |
| Point `at` | Finite, nonnegative timestamp in **milliseconds from media time zero**, strictly increasing with no duplicate timestamps. |
| Point `pos` | Finite position from **0 to 100**, inclusive; not a normalized 0–1 value. |

Always include a point strictly **after** `timeMs` so the scheduler has a next
target. Include the current or preceding endpoint when practical. Return a bounded
window rather than an entire track's worth of points: the function is called
repeatedly during playback and must also work after arbitrary seeks, including
hours into a track. Input includes the configured script offset and can be
negative near the start; handle that case without returning negative timestamps.

Keep each point's position stable for its absolute timestamp across calls.
Anchor phase to media time, rather than call counts, `Date.now()`, timers, or
unseeded randomness. The scheduler identifies targets by timestamp, so changing
the position of an already-issued target will not update that move. Generators
must honor this contract themselves; runtime validation of their output is not
currently provided.

The scheduler sends the next endpoint with the remaining wall-clock duration,
then lets that move run uninterrupted. Define endpoints and reversals rather
than generating tiny steps just to approximate a straight line. Playback speed
scales the duration automatically; do not apply it again in the generator. Pauses,
buffering, seeks and Stop / Resume updates are handled by the shared scheduler.

For example, create `ui/v2.5/src/motion/thirtyBpm.ts` for a two-second cycle between
20% and 80%, with a one-second move in each direction:

```ts
import type { MotionAlgorithm } from "./types";

export const thirtyBpm: MotionAlgorithm = {
  id: "stroke-30-bpm",
  name: "30 BPM gentle strokes",
  description: "One 20%–80%–20% cycle every two seconds at normal speed.",
  generate: (timeMs) => {
    const halfStrokeMs = 1000;
    const first = Math.max(0, Math.floor(timeMs / halfStrokeMs));
    return Array.from({ length: 4 }, (_, offset) => {
      const index = first + offset;
      return {
        at: index * halfStrokeMs,
        pos: index % 2 === 0 ? 20 : 80,
      };
    });
  },
};
```

Register it alongside the existing preset in `ui/v2.5/src/motion/index.ts`:

```ts
import { sixtyBpm } from "./sixtyBpm";
import { thirtyBpm } from "./thirtyBpm";
import type { MotionAlgorithm } from "./types";

export const motionAlgorithms: readonly MotionAlgorithm[] = [sixtyBpm, thirtyBpm];
```

At `timeMs = 1250`, this example returns points at 1000, 2000, 3000 and 4000 ms.
At normal speed with no offset, the scheduler targets 20% at 2000 ms with a
750 ms move. At twice the playback speed, that move takes 375 ms.

Use [`sixtyBpm.ts`](ui/v2.5/src/motion/sixtyBpm.ts) and the generator checks in
[`funscript-scheduler.test.mjs`](scripts/tests/funscript-scheduler.test.mjs) as
references. For a new algorithm, check deterministic output, sorted unique times,
position bounds, a future target, and behavior at negative times, exact endpoints
and long seeks. Run the scheduler checks shown above and the frontend TypeScript
check (`cd ui/v2.5 && pnpm check`), then validate motion on your device.

## Docker

A `docker-compose.yml` is available in `docker/production/`. Update the volume paths to point to your audio library and config directory, then:

```bash
docker compose -f docker/production/docker-compose.yml up -d
```

## License

GNU Affero General Public License v3.0 — see [LICENSE](LICENSE).

Based on [stashapp/stash](https://github.com/stashapp/stash).
