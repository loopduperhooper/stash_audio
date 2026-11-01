import { tdV1 } from "./tdV1";
import { sixtyBpm } from "./sixtyBpm";
import type { MotionAlgorithm } from "./types";

// Add repo-defined algorithms here to expose them in the player.
export const motionAlgorithms: readonly MotionAlgorithm[] = [sixtyBpm, tdV1];
