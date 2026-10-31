type QueueMedia = Pick<HTMLMediaElement,
  "currentTime" | "duration" | "currentSrc" | "src" | "readyState" | "ended" |
  "play" | "pause" | "load" | "addEventListener" | "removeEventListener">;

interface IQueueMediaOptions {
  source: string;
  initialPosition: number;
  autoplay: boolean;
  onPosition: (position: number, flush: boolean) => void;
  onEnded: () => void;
  onError: (message: string) => void;
  onPlaying: () => void;
}

// Reuse the media element while replacing its playback session. Listeners from
// the previous entry are removed before pause/load can emit transition events.
export function loadQueuedAudio(media: QueueMedia, options: IQueueMediaOptions): () => void {
  let ready = false;
  let disposed = false;

  function metadata() {
    if (disposed || !options.source || media.readyState < 1 || media.currentSrc !== media.src) return;
    ready = true;
    const position = Number.isFinite(options.initialPosition) ? Math.max(0, options.initialPosition) : 0;
    media.currentTime = Number.isFinite(media.duration) ? Math.min(position, media.duration) : position;
    if (options.autoplay) {
      void media.play().catch((error: unknown) => {
        if (!disposed && !(error instanceof Error && error.name === "AbortError")) {
          options.onError("Playback could not start automatically. Press Play in the audio controls to continue.");
        }
      });
    }
  }

  function position(flush: boolean) {
    if (!disposed && ready && Number.isFinite(media.currentTime)) options.onPosition(media.currentTime, flush);
  }
  function ended() {
    if (!disposed && ready && media.ended) {
      position(true);
      options.onEnded();
    }
  }
  const events: [string, () => void][] = [
    ["loadedmetadata", metadata],
    ["timeupdate", () => position(false)],
    ["pause", () => position(true)],
    ["seeked", () => position(true)],
    ["ended", ended],
    ["playing", () => { if (!disposed && ready) options.onPlaying(); }],
    ["error", () => {
      if (!disposed && options.source) options.onError("Unable to play this track. Try another track or use Next.");
    }],
  ];
  events.forEach(([name, handler]) => media.addEventListener(name, handler));
  // ready remains false until this source's metadata arrives: pause/timeupdate
  // from the old source must never persist its position against the new entry.
  media.pause();
  media.load();
  return () => {
    disposed = true;
    ready = false;
    events.forEach(([name, handler]) => media.removeEventListener(name, handler));
    media.pause();
  };
}
