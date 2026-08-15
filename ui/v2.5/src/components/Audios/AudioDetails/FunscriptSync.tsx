import React, { useEffect, useRef } from "react";
import { useFunscript } from "src/hooks/useFunscript";
import { useIntiface } from "src/hooks/IntifaceContext";

interface IProps {
  funscriptUrl: string | undefined;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const FunscriptSync: React.FC<IProps> = ({ funscriptUrl, audioRef }) => {
  const actions = useFunscript(funscriptUrl);
  const { enabled, status, linearDevices, sendLinear } = useIntiface();
  // Index (into `actions`) of the upcoming point we last sent a move command for.
  const lastTargetRef = useRef<number>(-1);
  const prevTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || status !== "connected" || !actions || actions.length === 0 || linearDevices.length === 0) {
      return;
    }

    let rafId: number;

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      const el = audioRef.current;
      if (!el || el.paused) return;

      const nowMs = el.currentTime * 1000;

      // Seek (including loop-back to 0): drop tracking so the next tick
      // re-targets from scratch instead of replaying stale commands.
      if (Math.abs(nowMs - prevTimeRef.current) > 1000) {
        lastTargetRef.current = -1;
      }
      prevTimeRef.current = nowMs;

      // Binary search: last action where at <= nowMs
      let lo = 0;
      let hi = actions.length - 1;
      let idx = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (actions[mid].at <= nowMs) {
          idx = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      const targetIdx = idx + 1;
      const target = actions[targetIdx];
      if (!target || targetIdx === lastTargetRef.current) return;
      lastTargetRef.current = targetIdx;

      // Glide toward the *upcoming* point (not the one we just passed) in
      // whatever time actually remains until it's due. Sampling here runs
      // at rAF rate rather than the browser's throttled `timeupdate` event
      // (~4Hz), so a late tick doesn't understate how little time is left —
      // that understatement is what made fast passages feel like the toy was
      // permanently a beat behind.
      const durationMs = Math.max(20, target.at - nowMs);
      const position = target.pos / 100;

      for (const device of linearDevices) {
        sendLinear(device.index, position, durationMs);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [actions, enabled, status, linearDevices, sendLinear, audioRef]);

  return null;
};
