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

## Docker

A `docker-compose.yml` is available in `docker/production/`. Update the volume paths to point to your audio library and config directory, then:

```bash
docker compose -f docker/production/docker-compose.yml up -d
```

## License

GNU Affero General Public License v3.0 — see [LICENSE](LICENSE).

Based on [stashapp/stash](https://github.com/stashapp/stash).
