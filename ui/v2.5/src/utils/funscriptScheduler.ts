export interface FunscriptAction {
  at: number;
  pos: number;
}

// Generated sources return a bounded window on the absolute media timeline.
export type FunscriptSource = readonly FunscriptAction[] |
  ((mediaTimeMs: number) => readonly FunscriptAction[]);

export interface SyncTiming {
  intervalMs: number;
  offsetMs: number;
}

export const DEFAULT_SYNC_TIMING: SyncTiming = { intervalMs: 20, offsetMs: 0 };

export function normalizeSyncTiming(value: Partial<SyncTiming>): SyncTiming {
  return {
    intervalMs: Number.isFinite(value.intervalMs)
      ? Math.round(Math.max(10, Math.min(100, value.intervalMs!)))
      : DEFAULT_SYNC_TIMING.intervalMs,
    offsetMs: Number.isFinite(value.offsetMs)
      ? Math.round(Math.max(-1000, Math.min(1000, value.offsetMs!)))
      : DEFAULT_SYNC_TIMING.offsetMs,
  };
}

// First future point: send its position with the time remaining until arrival.
// Missed points are skipped rather than replayed as a burst of stale commands.
export function nextFunscriptTarget(
  actions: readonly FunscriptAction[],
  mediaTimeMs: number,
  playbackRate: number,
  offsetMs = 0
) {
  if (!Number.isFinite(mediaTimeMs) || !Number.isFinite(playbackRate) || playbackRate <= 0) return null;
  const time = mediaTimeMs + offsetMs;
  let lo = 0;
  let hi = actions.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (actions[mid].at <= time) lo = mid + 1;
    else hi = mid;
  }
  if (lo === actions.length) return null;
  return {
    index: lo,
    at: actions[lo].at,
    position: actions[lo].pos / 100,
    durationMs: Math.max(1, Math.round((actions[lo].at - time) / playbackRate)),
  };
}

interface SchedulerClock {
  setTimeout: (callback: () => void, delay: number) => number;
  clearTimeout: (id: number) => void;
}

type MediaClock = Pick<HTMLMediaElement,
  "currentTime" | "playbackRate" | "paused" | "ended" | "seeking" |
  "readyState" | "addEventListener" | "removeEventListener">;

export function startFunscriptScheduler(
  media: MediaClock,
  actions: FunscriptSource,
  send: (position: number, durationMs: number) => void,
  timing: SyncTiming = DEFAULT_SYNC_TIMING,
  clock: SchedulerClock = window
): () => void {
  const { intervalMs, offsetMs } = normalizeSyncTiming(timing);
  let timer: number | undefined;
  let lastAt: number | undefined;
  let disposed = false;
  let waiting = false;

  function cancel() {
    if (timer !== undefined) clock.clearTimeout(timer);
    timer = undefined;
    lastAt = undefined;
  }

  function tick() {
    timer = undefined;
    if (disposed || waiting || media.paused || media.ended || media.seeking || media.readyState < 3) return;
    const timeMs = media.currentTime * 1000;
    const points = typeof actions === "function" ? actions(timeMs + offsetMs) : actions;
    const target = nextFunscriptTarget(points, timeMs, media.playbackRate, offsetMs);
    if (!target) return;
    if (target.at !== lastAt) {
      lastAt = target.at;
      send(target.position, target.durationMs);
    }
    // Leave each endpoint move uninterrupted. Wake at its deadline even when
    // the polling interval is longer, so reversals do not wait for another poll.
    // Each tick reads media time again; delayed callbacks never replay old moves.
    timer = clock.setTimeout(tick, Math.min(intervalMs, target.durationMs));
  }

  function restart() { cancel(); tick(); }
  function suspend() { cancel(); }
  function buffer() { waiting = true; cancel(); }
  function playing() { waiting = false; restart(); }
  const events: [string, () => void][] = [
    ["playing", playing], ["pause", suspend], ["ended", suspend],
    ["seeking", suspend], ["seeked", restart], ["ratechange", restart],
    ["waiting", buffer], ["emptied", buffer], ["error", buffer],
  ];
  events.forEach(([name, handler]) => media.addEventListener(name, handler));
  tick();
  return () => {
    disposed = true;
    cancel();
    events.forEach(([name, handler]) => media.removeEventListener(name, handler));
  };
}
