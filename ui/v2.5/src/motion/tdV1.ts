import type { MotionAlgorithm } from "./types";
import type { FunscriptAction } from "../utils/funscriptScheduler";

export type TdMode = 1 | 2 | 3 | 4 | 5;

export interface TdState {
  mode: TdMode;
  points: FunscriptAction[];
}

// A fixed seed makes the randomized timeline independent of call order/seeks.
function randomSource() {
  let seed = 0x54445631;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
}

// Explicit transition rules: full/half strokes -> partial hold;
// acceleration -> zero hold; either hold -> a randomly selected motion mode.
export function nextTdMode(mode: TdMode, random: () => number): TdMode {
  if (mode === 2 || mode === 4) return 1;
  if (mode === 3) return 5;
  return ([2, 3, 4] as const)[Math.floor(random() * 3)];
}

export function buildTdState(
  mode: TdMode,
  at: number,
  position: number,
  random: () => number
): TdState {
  const points: FunscriptAction[] = [{ at, pos: position }];
  const between = (min: number, max: number) => Math.round(min + random() * (max - min));
  const move = (pos: number, duration: number) => {
    at += duration;
    position = pos;
    points.push({ at, pos });
  };

  if (mode === 1 || mode === 5) {
    const heldPosition = mode === 5 ? 0 : between(1, 99);
    // Allow a one-second approach, then hold for the full requested duration.
    if (position !== heldPosition) move(heldPosition, 1000);
    move(heldPosition, mode === 5 ? between(10000, 15000) : between(5000, 15000));
  } else if (mode === 3) {
    const windowMs = between(15000, 20000);
    // Five alternating full movements. Their durations decrease linearly from
    // 5–7 seconds to exactly 1 second and sum to the chosen 15–20 second window.
    // Align to an endpoint before beginning that window.
    if (position !== 0 && position !== 100) move(position < 50 ? 0 : 100, 1000);
    const startDuration = (2 * windowMs) / 5 - 1000;
    const startAt = at;
    for (let i = 0; i < 5; i++) {
      const count = i + 1;
      const deadline = startAt + Math.round(count * startDuration
        + ((1000 - startDuration) / 4) * count * i / 2);
      move(position === 0 ? 100 : 0, deadline - at);
    }
  } else {
    const upper = mode === 2 ? 100 : 50;
    const minMs = mode === 2 ? 3000 : 2000;
    const maxMs = mode === 2 ? 7000 : 4000;
    if (position !== 0 && position !== upper) move(position < upper / 2 ? 0 : upper, 1000);
    // Favor several successive movements while still allowing 1 through 30.
    const count = 1 + Math.floor(random() * random() * 30);
    for (let i = 0; i < count; i++) {
      move(position === 0 ? upper : 0, between(minMs, maxMs));
    }
  }
  return { mode, points };
}

export const tdV1: MotionAlgorithm = {
  id: "td-v1",
  name: "T&D_v1",
  description: "Randomized partial holds, slow full/half strokes and accelerating full strokes, with recovery holds.",
  generate: (timeMs) => {
    const random = randomSource();
    const time = Math.max(0, timeMs);
    let mode: TdMode = 1;
    let at = 0;
    let position = 0;
    // Replay compact states rather than retaining a growing track-sized array.
    // Each state has at most 32 points, even after a long seek.
    for (;;) {
      const state = buildTdState(mode, at, position, random);
      const end = state.points[state.points.length - 1];
      if (end.at > time) {
        const future = state.points.findIndex((point) => point.at > time);
        return state.points.slice(Math.max(0, future - 1), future + 3);
      }
      at = end.at;
      position = end.pos;
      mode = nextTdMode(mode, random);
    }
  },
};
