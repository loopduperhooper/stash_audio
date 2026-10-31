export interface IAudioQueueEntry {
  key: string;
  id: string;
  title: string;
  // Undefined: resolve on load. Null: this entry has no group.
  groupId?: string | null;
}

export interface IAudioQueueState {
  current: IAudioQueueEntry | null;
  upcoming: IAudioQueueEntry[];
  position: number | null;
  autoplay: boolean;
}

export const EMPTY_AUDIO_QUEUE: IAudioQueueState = {
  current: null,
  upcoming: [],
  position: null,
  autoplay: false,
};

export type AudioQueueAction =
  | { type: "play"; entry: IAudioQueueEntry }
  | { type: "enqueue"; entry: IAudioQueueEntry; next: boolean }
  | { type: "advance"; currentKey: string | null; fallback: IAudioQueueEntry | null }
  | { type: "resolve"; key: string; title: string; groupId: string | null }
  | { type: "remove"; key: string }
  | { type: "move"; key: string; direction: -1 | 1 }
  | { type: "clear" }
  | { type: "stop" };

export function audioQueueReducer(state: IAudioQueueState, action: AudioQueueAction): IAudioQueueState {
  switch (action.type) {
    case "play":
      return { current: action.entry, upcoming: [], position: null, autoplay: true };
    case "enqueue":
      return { ...state, upcoming: action.next ? [action.entry, ...state.upcoming] : [...state.upcoming, action.entry] };
    case "advance": {
      // An old media event or double click must not advance a newer entry.
      if ((state.current?.key ?? null) !== action.currentKey) return state;
      const next = state.upcoming[0] ?? action.fallback;
      if (!next) return state;
      return { current: next, upcoming: state.upcoming.slice(1), position: 0, autoplay: true };
    }
    case "resolve":
      if (!state.current || state.current.key !== action.key) return state;
      if (state.current.title === action.title && state.current.groupId === action.groupId) return state;
      return { ...state, current: { ...state.current, title: action.title, groupId: action.groupId } };
    case "remove":
      return { ...state, upcoming: state.upcoming.filter((entry) => entry.key !== action.key) };
    case "move": {
      const index = state.upcoming.findIndex((entry) => entry.key === action.key);
      const target = index + action.direction;
      if (index < 0 || target < 0 || target >= state.upcoming.length) return state;
      const upcoming = [...state.upcoming];
      [upcoming[index], upcoming[target]] = [upcoming[target], upcoming[index]];
      return { ...state, upcoming };
    }
    case "clear":
      return { ...state, upcoming: [] };
    case "stop":
      return { ...EMPTY_AUDIO_QUEUE };
  }
}

export interface IAudioGroupOrder {
  id: string;
  audios: readonly { id: string }[];
}

export function nextAudioInGroup(currentId: string, group: IAudioGroupOrder | undefined): string | null {
  if (!group) return null;
  const index = group.audios.findIndex((audio) => audio.id === currentId);
  return index < 0 ? null : group.audios[index + 1]?.id ?? null;
}

export function chooseAudioGroup(
  groups: readonly IAudioGroupOrder[],
  preferredId: string | null | undefined,
  random = Math.random
): string | null {
  // A resolved no-group entry remains stable, including after refresh.
  if (preferredId === null) return null;
  if (preferredId !== undefined) return groups.some((group) => group.id === preferredId) ? preferredId : null;
  return groups.length ? groups[Math.min(groups.length - 1, Math.floor(random() * groups.length))].id : null;
}

function isEntry(value: unknown): value is IAudioQueueEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as IAudioQueueEntry;
  return typeof entry.key === "string" && !!entry.key && typeof entry.id === "string" && !!entry.id &&
    typeof entry.title === "string" && (entry.groupId === undefined || entry.groupId === null || typeof entry.groupId === "string");
}

export function restoreAudioQueue(raw: string | null): IAudioQueueState {
  try {
    const saved = JSON.parse(raw ?? "null");
    if (saved?.version !== 1 || !Array.isArray(saved.upcoming) ||
      !saved.upcoming.every(isEntry) || (saved.current !== null && !isEntry(saved.current))) return { ...EMPTY_AUDIO_QUEUE };
    const entries: IAudioQueueEntry[] = [...(saved.current ? [saved.current] : []), ...saved.upcoming];
    if (new Set(entries.map((entry) => entry.key)).size !== entries.length) return { ...EMPTY_AUDIO_QUEUE };
    return {
      current: saved.current,
      upcoming: saved.upcoming,
      position: typeof saved.position === "number" && Number.isFinite(saved.position) && saved.position >= 0 ? saved.position : null,
      // Refresh never starts audio or motion without user interaction.
      autoplay: false,
    };
  } catch {
    return { ...EMPTY_AUDIO_QUEUE };
  }
}

export function serializeAudioQueue(state: IAudioQueueState, position = state.position): string {
  return JSON.stringify({ version: 1, current: state.current, upcoming: state.upcoming, position });
}
