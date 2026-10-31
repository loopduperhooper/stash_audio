import type { MotionAlgorithm } from "./types";

// One full out-and-back stroke per beat. Phase is anchored to media time zero.
export const sixtyBpm: MotionAlgorithm = {
  id: "stroke-60-bpm",
  name: "60 BPM strokes",
  description: "One full stroke per second, from 0% to 100% and back. Follows playback speed.",
  generate: (timeMs) => {
    const first = Math.max(0, Math.floor(timeMs / 500));
    return Array.from({ length: 4 }, (_, offset) => {
      const index = first + offset;
      return { at: index * 500, pos: index % 2 === 0 ? 0 : 100 };
    });
  },
};
