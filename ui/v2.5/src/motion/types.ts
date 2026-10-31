import type { FunscriptAction } from "../utils/funscriptScheduler";

export interface MotionAlgorithm {
  id: string;
  name: string;
  description: string;
  // Pure, deterministic, sorted unique points on the absolute media timeline.
  // Include a future target beyond timeMs; positions are 0–100, times in ms.
  // Return a bounded window so duration and seeks do not require a whole script.
  generate: (timeMs: number) => readonly FunscriptAction[];
}
