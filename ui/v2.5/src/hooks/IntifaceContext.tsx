import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ButtplugDevice, ButtplugLinearClient } from "src/utils/buttplug";

const STORAGE_URL_KEY = "intiface_ws_url";
const STORAGE_ENABLED_KEY = "intiface_enabled";
const DEFAULT_URL = "ws://localhost:12345";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface IntifaceContextValue {
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
    if (enabled && status === "connected") {
      clientRef.current?.sendLinear(deviceIndex, position, durationMs);
    }
  }, [enabled, status]);

  // Clean up on unmount
  useEffect(() => {
    return () => clientRef.current?.disconnect();
  }, []);

  const linearDevices = devices.filter((d) => d.canPosition);

  return (
    <IntifaceContext.Provider
      value={{ enabled, setEnabled, wsUrl, setWsUrl, status, errorMessage, devices, linearDevices, connect, disconnect, sendLinear }}
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
