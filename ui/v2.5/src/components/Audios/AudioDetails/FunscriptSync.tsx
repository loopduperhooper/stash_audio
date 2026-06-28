import React, { useEffect, useRef } from "react";
import { useFunscript } from "src/hooks/useFunscript";
import { useIntiface } from "src/hooks/IntifaceContext";

interface IProps {
  funscriptUrl: string | undefined;
  currentTimeMs: number;
}

export const FunscriptSync: React.FC<IProps> = ({ funscriptUrl, currentTimeMs }) => {
  const actions = useFunscript(funscriptUrl);
  const { enabled, status, linearDevices, sendLinear } = useIntiface();
  const lastIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (!enabled || status !== "connected" || !actions || linearDevices.length === 0) return;

    // Binary search: find last action where at <= currentTimeMs
    let lo = 0;
    let hi = actions.length - 1;
    let idx = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (actions[mid].at <= currentTimeMs) {
        idx = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    if (idx < 0 || idx === lastIndexRef.current) return;
    lastIndexRef.current = idx;

    const action = actions[idx];
    const next = actions[idx + 1];
    const durationMs = next ? next.at - action.at : 500;
    const position = action.pos / 100;

    for (const device of linearDevices) {
      sendLinear(device.index, position, durationMs);
    }
  }, [currentTimeMs, actions, enabled, status, linearDevices, sendLinear]);

  // Reset index on seek (large time jump)
  const prevTimeRef = useRef<number>(0);
  useEffect(() => {
    if (Math.abs(currentTimeMs - prevTimeRef.current) > 1000) {
      lastIndexRef.current = -1;
    }
    prevTimeRef.current = currentTimeMs;
  }, [currentTimeMs]);

  return null;
};
