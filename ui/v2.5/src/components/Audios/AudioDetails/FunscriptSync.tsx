import React, { useEffect } from "react";
import { useFunscript } from "src/hooks/useFunscript";
import { useIntiface } from "src/hooks/IntifaceContext";
import type { MotionAlgorithm } from "src/motion/types";
import { startFunscriptScheduler } from "src/utils/funscriptScheduler";

interface IProps {
  funscriptUrl: string | undefined;
  audioRef: React.RefObject<HTMLAudioElement>;
  algorithm?: MotionAlgorithm;
}

export const FunscriptSync: React.FC<IProps> = ({ funscriptUrl, audioRef, algorithm }) => {
  const actions = useFunscript(algorithm ? undefined : funscriptUrl);
  const { enabled, status, updatesSuspended, linearDevices, sendLinear, syncTiming } = useIntiface();

  useEffect(() => {
    const media = audioRef.current;
    const source = algorithm?.generate ?? actions;
    if (!media || !enabled || status !== "connected" || updatesSuspended || !source || !linearDevices.length) return;
    return startFunscriptScheduler(media, source, (position, durationMs) => {
      for (const device of linearDevices) sendLinear(device.index, position, durationMs);
    }, syncTiming);
  }, [audioRef, funscriptUrl, algorithm, actions, enabled, status, updatesSuspended, linearDevices, sendLinear, syncTiming]);

  return null;
};
