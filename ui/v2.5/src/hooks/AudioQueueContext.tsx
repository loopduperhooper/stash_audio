import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import * as GQL from "src/core/generated-graphql";
import { objectTitle } from "src/core/files";
import {
  audioQueueReducer,
  chooseAudioGroup,
  nextAudioInGroup,
  restoreAudioQueue,
  serializeAudioQueue,
} from "src/models/audioQueue";
import type { IAudioQueueEntry, IAudioQueueState } from "src/models/audioQueue";

const STORAGE_KEY = "audio_playback_queue_v1";
type PlayableAudio = Pick<GQL.SlimAudioDataFragment, "id" | "title" | "files">;

function makeEntry(audio: PlayableAudio, groupId?: string): IAudioQueueEntry {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    id: audio.id,
    title: objectTitle(audio),
    groupId,
  };
}

function loadQueue() {
  try {
    return restoreAudioQueue(localStorage.getItem(STORAGE_KEY));
  } catch {
    return restoreAudioQueue(null);
  }
}

interface IAudioQueueContextValue {
  state: IAudioQueueState;
  audio: GQL.AudioDataFragment | null;
  loading: boolean;
  error: string | null;
  persistenceError: boolean;
  fallbackTitle: string | null;
  canAdvance: boolean;
  play: (audio: PlayableAudio, groupId?: string) => void;
  enqueue: (audio: PlayableAudio, next?: boolean, groupId?: string) => void;
  advance: () => void;
  remove: (key: string) => void;
  move: (key: string, direction: -1 | 1) => void;
  clear: () => void;
  stop: () => void;
  retry: () => void;
  savePosition: (key: string, position: number, flush?: boolean) => void;
}

const AudioQueueContext = createContext<IAudioQueueContextValue | null>(null);

export const AudioQueueProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(audioQueueReducer, undefined, loadQueue);
  const [persistenceError, setPersistenceError] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const positionRef = useRef<{ key: string; position: number } | null>(null);
  const lastSave = useRef(0);
  const currentKey = state.current?.key;
  const { data, loading, error, refetch } = GQL.useFindAudioQuery({
    variables: { id: state.current?.id ?? "" },
    skip: !state.current,
    fetchPolicy: "cache-and-network",
  });
  const audio =
    state.current && data?.findAudio?.id === state.current.id
      ? data.findAudio
      : null;

  useEffect(() => {
    if (!state.current || !audio) return;
    dispatch({
      type: "resolve",
      key: state.current.key,
      title: objectTitle(audio),
      groupId: chooseAudioGroup(audio.groups, state.current.groupId),
    });
  }, [audio, state.current]);

  const persist = useCallback(() => {
    const latest = stateRef.current;
    const position =
      positionRef.current?.key === latest.current?.key
        ? positionRef.current?.position
        : latest.position;
    try {
      localStorage.setItem(STORAGE_KEY, serializeAudioQueue(latest, position));
      lastSave.current = Date.now();
      setPersistenceError(false);
    } catch {
      setPersistenceError(true);
    }
  }, []);

  useEffect(() => {
    persist();
  }, [state, persist]);
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") persist();
    };
    window.addEventListener("pagehide", persist);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      persist();
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [persist]);

  const savePosition = useCallback(
    (key: string, position: number, flush = false) => {
      if (
        stateRef.current.current?.key !== key ||
        !Number.isFinite(position) ||
        position < 0
      ) return;
      positionRef.current = { key, position };
      if (flush || Date.now() - lastSave.current >= 2000) persist();
    },
    [persist]
  );

  const group = audio?.groups.find((item) => item.id === state.current?.groupId);
  const fallbackId = audio ? nextAudioInGroup(audio.id, group) : null;
  const fallback = group?.audios.find((item) => item.id === fallbackId);
  const advance = useCallback(() => {
    dispatch({
      type: "advance",
      currentKey: currentKey ?? null,
      fallback: fallback ? makeEntry(fallback, group?.id) : null,
    });
  }, [currentKey, fallback, group?.id]);
  const play = useCallback(
    (item: PlayableAudio, groupId?: string) =>
      dispatch({ type: "play", entry: makeEntry(item, groupId) }),
    []
  );
  const enqueue = useCallback(
    (item: PlayableAudio, next = false, groupId?: string) =>
      dispatch({ type: "enqueue", entry: makeEntry(item, groupId), next }),
    []
  );
  const remove = useCallback((key: string) => dispatch({ type: "remove", key }), []);
  const move = useCallback(
    (key: string, direction: -1 | 1) => dispatch({ type: "move", key, direction }),
    []
  );
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const stop = useCallback(() => dispatch({ type: "stop" }), []);
  const retry = useCallback(() => {
    void refetch().catch(() => {});
  }, [refetch]);

  const value = useMemo<IAudioQueueContextValue>(
    () => ({
      state,
      audio,
      loading: !!state.current && loading && !audio,
      error:
        state.current && !audio && !loading
          ? error?.message ?? "This track is no longer available."
          : null,
      persistenceError,
      fallbackTitle: fallback ? objectTitle(fallback) : null,
      canAdvance: state.upcoming.length > 0 || !!fallback,
      play,
      enqueue,
      advance,
      remove,
      move,
      clear,
      stop,
      retry,
      savePosition,
    }),
    [state, audio, loading, error, persistenceError, fallback, play, enqueue,
      advance, remove, move, clear, stop, retry, savePosition]
  );

  return (
    <AudioQueueContext.Provider value={value}>
      <div
        className={`audio-queue-session${state.current || state.upcoming.length ? " active" : ""}`}
      >
        {children}
      </div>
    </AudioQueueContext.Provider>
  );
};

export function useAudioQueue() {
  const context = useContext(AudioQueueContext);
  if (!context) throw new Error("useAudioQueue must be used inside AudioQueueProvider");
  return context;
}
