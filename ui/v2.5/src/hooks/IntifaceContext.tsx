import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ButtplugDevice, ButtplugLinearClient } from "src/utils/buttplug";
import { DEFAULT_DEVICE_SYNC_SHORTCUT, deviceSyncShortcut } from "src/utils/deviceSyncShortcut";
import { DEFAULT_SYNC_TIMING, normalizeSyncTiming, SyncTiming } from "src/utils/funscriptScheduler";

const STORAGE_URL_KEY = "intiface_ws_url";
const STORAGE_ENABLED_KEY = "intiface_enabled";
const STORAGE_SHORTCUT_KEY = "intiface_update_shortcut";
const STORAGE_TIMING_KEY = "intiface_sync_timing";
const DEFAULT_URL = "ws://localhost:12345";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface IntifaceContextValue {
  syncTiming: SyncTiming;
  setSyncTiming: (value: SyncTiming) => void;
  updatesSuspended: boolean;
  toggleUpdates: () => void;
  updateShortcut: string;
  setUpdateShortcut: (v: string) => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  wsUrl: string;
  setWsUrl: (v: string) => void;
  status: ConnectionStatus;
  errorMessage: string | null;
  devices: ButtplugDevice[];
  linearDevices: ButtplugDevice[];
  connect: () => Promise<void>;
  disconnect: () => void;
  sendLinear: (deviceIndex: number, position: number, durationMs: number) => void;
}

const IntifaceContext = createContext<IntifaceContextValue | null>(null);

export const IntifaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabledState] = useState(
    () => localStorage.getItem(STORAGE_ENABLED_KEY) !== "false"
  );
  const [wsUrl, setWsUrlState] = useState(
    () => localStorage.getItem(STORAGE_URL_KEY) ?? DEFAULT_URL
  );
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devices, setDevices] = useState<ButtplugDevice[]>([]);
  const clientRef = useRef<ButtplugLinearClient | null>(null);
  const [syncTiming, setSyncTimingState] = useState<SyncTiming>(() => {
    try {
      return normalizeSyncTiming(JSON.parse(localStorage.getItem(STORAGE_TIMING_KEY) || "{}") || {});
    } catch {
      return DEFAULT_SYNC_TIMING;
    }
  });
  const setSyncTiming = useCallback((value: SyncTiming) => {
    const normalized = normalizeSyncTiming(value);
    setSyncTimingState(normalized);
    localStorage.setItem(STORAGE_TIMING_KEY, JSON.stringify(normalized));
  }, []);
  const [updatesSuspended, setUpdatesSuspended] = useState(false);
  const suspendedRef = useRef(false);
  const [updateShortcut, setUpdateShortcutState] = useState(
    () => localStorage.getItem(STORAGE_SHORTCUT_KEY) || DEFAULT_DEVICE_SYNC_SHORTCUT
  );

  const toggleUpdates = useCallback(() => {
    // Guard command dispatch immediately, before React commits the new state.
    suspendedRef.current = !suspendedRef.current;
    setUpdatesSuspended(suspendedRef.current);
  }, []);

  const setUpdateShortcut = useCallback((value: string) => {
    setUpdateShortcutState(value);
    localStorage.setItem(STORAGE_SHORTCUT_KEY, value);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!enabled || status !== "connected" || event.isComposing) return;
      const target = event.target;
      if (target instanceof Element && target.closest(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'
      )) return;
      if (deviceSyncShortcut(event) !== updateShortcut) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!event.repeat) toggleUpdates();
    }
    // Handle before page shortcuts, so a configured binding has one action.
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [enabled, status, updateShortcut, toggleUpdates]);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    localStorage.setItem(STORAGE_ENABLED_KEY, String(v));
    if (!v) {
      clientRef.current?.disconnect();
      setStatus("disconnected");
    }
  }, []);

  const setWsUrl = useCallback((v: string) => {
    setWsUrlState(v);
    localStorage.setItem(STORAGE_URL_KEY, v);
  }, []);

  const connect = useCallback(async () => {
    if (!enabled) return;
    clientRef.current?.disconnect();

    const client = new ButtplugLinearClient();
    clientRef.current = client;

    client.onDevicesChanged((list) => setDevices(list));

    setStatus("connecting");
    setErrorMessage(null);

    try {
      await client.connect(wsUrl);
      setStatus("connected");
      setDevices(client.getDevices());
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  }, [enabled, wsUrl]);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
    setStatus("disconnected");
    setDevices([]);
  }, []);

  const sendLinear = useCallback((deviceIndex: number, position: number, durationMs: number) => {
    if (enabled && status === "connected" && !suspendedRef.current) {
      clientRef.current?.sendLinear(deviceIndex, position, durationMs);
    }
  }, [enabled, status]);

  // Clean up on unmount
  useEffect(() => {
    return () => clientRef.current?.disconnect();
  }, []);

  const linearDevices = useMemo(() => devices.filter((d) => d.canPosition), [devices]);

  return (
    <IntifaceContext.Provider
      value={{ syncTiming, setSyncTiming, updatesSuspended, toggleUpdates, updateShortcut, setUpdateShortcut, enabled, setEnabled, wsUrl, setWsUrl, status, errorMessage, devices, linearDevices, connect, disconnect, sendLinear }}
    >
      {children}
    </IntifaceContext.Provider>
  );
};

export function useIntiface(): IntifaceContextValue {
  const ctx = useContext(IntifaceContext);
  if (!ctx) throw new Error("useIntiface must be used inside IntifaceProvider");
  return ctx;
}
