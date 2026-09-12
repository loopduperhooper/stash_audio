import React, { useEffect, useRef } from "react";
import { useFunscript, FunscriptAction } from "src/hooks/useFunscript";
import { useIntiface } from "src/hooks/IntifaceContext";

interface IProps {
  funscriptUrl: string | undefined;
  audioRef: React.RefObject<HTMLAudioElement>;
}

// Matches MultiFunPlayer's Buttplug output target cadence
// (AsyncFixedUpdateContext: UpdateInterval=50, clamped [16, 200]).
const TARGET_INTERVAL_MS = 50;
const MIN_INTERVAL_MS = 16;
const MAX_INTERVAL_MS = 200;
const DIRTY_THRESHOLD = 0.005;

// Linear-interpolate the funscript's position at `atMs`, the same way any
// funscript player renders motion between keyframes (not just "jump to the
// next point"). Endpoints clamp to the first/last action's position.
function interpolatePosition(actions: FunscriptAction[], atMs: number): number {
  if (atMs <= actions[0].at) return actions[0].pos / 100;
  const last = actions[actions.length - 1];
  if (atMs >= last.at) return last.pos / 100;

  let lo = 0;
  let hi = actions.length - 1;
  let idx = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (actions[mid].at <= atMs) {
      idx = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  const a = actions[idx];
  const b = actions[idx + 1];
  if (!b) return a.pos / 100;
  const t = (atMs - a.at) / (b.at - a.at);
  return (a.pos + (b.pos - a.pos) * t) / 100;
}

export const FunscriptSync: React.FC<IProps> = ({ funscriptUrl, audioRef }) => {
  const actions = useFunscript(funscriptUrl);
  const { enabled, status, linearDevices, sendLinear } = useIntiface();
  const lastTickWallRef = useRef<number>(0);
  const lastSentPosRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || status !== "connected" || !actions || actions.length === 0 || linearDevices.length === 0) {
      return;
    }

    let rafId: number;
    lastTickWallRef.current = performance.now();
    lastSentPosRef.current = null;

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      const el = audioRef.current;
      if (!el || el.paused) return;

      // Fixed-cadence gate: rAF fires faster than we want to talk to the
      // device, so only act once ~TARGET_INTERVAL_MS of wall-clock time has
      // actually passed. Using real elapsed time (not the nominal target)
      // for the command's duration below is what makes this self-correcting
      // — a late tick just reports a longer duration, it never accumulates.
      const wallNow = performance.now();
      const wallElapsed = wallNow - lastTickWallRef.current;
      if (wallElapsed < MIN_INTERVAL_MS) return;
      lastTickWallRef.current = wallNow;

      const nowMs = el.currentTime * 1000;
      const position = interpolatePosition(actions, nowMs);

      // Re-target the device at whatever the script's *current* position is,
      // every tick — not the next keyframe. A dropped or delayed command only
      // costs one tick's worth of drift, since the next tick re-anchors to
      // the live curve rather than continuing to chase a stale future point.
      if (lastSentPosRef.current === null || Math.abs(position - lastSentPosRef.current) >= DIRTY_THRESHOLD) {
        const durationMs = Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, Math.round(wallElapsed || TARGET_INTERVAL_MS)));
        for (const device of linearDevices) {
          sendLinear(device.index, position, durationMs);
        }
        lastSentPosRef.current = position;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [actions, enabled, status, linearDevices, sendLinear, audioRef]);

  return null;
};
