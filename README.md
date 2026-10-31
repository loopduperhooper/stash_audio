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

The bottom player stays mounted while browsing. **Show queue** opens the current
track's cover, motion controls and upcoming tracks. Move queued tracks earlier or
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

To add an algorithm, create a TypeScript module in `ui/v2.5/src/motion` implementing
`MotionAlgorithm`, then register it in that directory's `index.ts`. Each module
supplies an ID, name, description and pure `generate(timeMs)` function returning a
small sorted window of funscript-style `{ at, pos }` points. Timestamps are absolute
media milliseconds, positions are 0–100, and the window must include a future
target. Keep the same timeline/phase on repeated calls and seeks. The scheduler
identifies targets by timestamp, so sliding windows do not resend unchanged
commands. Generation runs locally; it does not create or modify track files.

## Docker

A `docker-compose.yml` is available in `docker/production/`. Update the volume paths to point to your audio library and config directory, then:

```bash
docker compose -f docker/production/docker-compose.yml up -d
```

## License

GNU Affero General Public License v3.0 — see [LICENSE](LICENSE).

Based on [stashapp/stash](https://github.com/stashapp/stash).
