// Minimal inline Buttplug v3 client — linear devices only.
// Avoids an npm dep that can't be installed on the VirtualBox shared filesystem.

export interface ButtplugDevice {
  index: number;
  name: string;
  canPosition: boolean;
}

type BPListener = (devices: ButtplugDevice[]) => void;

interface LinearVector {
  Index: number;
  Duration: number;
  Position: number;
}

export class ButtplugLinearClient {
  private ws: WebSocket | null = null;
  private msgId = 1;
  private devices: Map<number, ButtplugDevice> = new Map();
  private listeners: Set<BPListener> = new Set();

  private nextId(): number {
    return this.msgId++;
  }

  private send(msg: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify([msg]));
    }
  }

  private emit(): void {
    const list = Array.from(this.devices.values());
    this.listeners.forEach((l) => l(list));
  }

  onDevicesChanged(cb: BPListener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.send({
          RequestServerInfo: {
            Id: this.nextId(),
            ClientName: "stash_audio",
            MessageVersion: 3,
          },
        });
      };

      this.ws.onmessage = (ev) => {
        const messages: object[] = JSON.parse(ev.data as string);
        for (const msg of messages) {
          this.handleMessage(msg, resolve, reject);
        }
      };

      this.ws.onerror = () => reject(new Error("WebSocket error"));
      this.ws.onclose = () => {
        this.devices.clear();
        this.emit();
      };
    });
  }

  private handleMessage(msg: object, resolve?: () => void, reject?: (e: Error) => void): void {
    if ("ServerInfo" in msg) {
      // Handshake complete — request device list
      this.send({ RequestDeviceList: { Id: this.nextId() } });
      this.send({ StartScanning: { Id: this.nextId() } });
      resolve?.();
      return;
    }

    if ("DeviceList" in msg) {
      const { Devices } = (msg as { DeviceList: { Devices: BPRawDevice[] } }).DeviceList;
      for (const d of Devices) this.registerDevice(d);
      this.emit();
      return;
    }

    if ("DeviceAdded" in msg) {
      this.registerDevice((msg as { DeviceAdded: BPRawDevice }).DeviceAdded);
      this.emit();
      return;
    }

    if ("DeviceRemoved" in msg) {
      const idx = (msg as { DeviceRemoved: { DeviceIndex: number } }).DeviceRemoved.DeviceIndex;
      this.devices.delete(idx);
      this.emit();
      return;
    }

    if ("Error" in msg) {
      const err = (msg as { Error: { ErrorMessage: string } }).Error;
      reject?.(new Error(err.ErrorMessage));
    }
  }

  private registerDevice(raw: BPRawDevice): void {
    const canPosition =
      !!raw.DeviceMessages?.LinearCmd ||
      !!raw.DeviceMessages?.FleshlightLaunchFW12Cmd;
    this.devices.set(raw.DeviceIndex, {
      index: raw.DeviceIndex,
      name: raw.DeviceName,
      canPosition,
    });
  }

  sendLinear(deviceIndex: number, position: number, durationMs: number): void {
    const vectors: LinearVector[] = [
      { Index: 0, Duration: Math.round(durationMs), Position: Math.max(0, Math.min(1, position)) },
    ];
    this.send({
      LinearCmd: {
        Id: this.nextId(),
        DeviceIndex: deviceIndex,
        Vectors: vectors,
      },
    });
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.devices.clear();
    this.emit();
  }

  getDevices(): ButtplugDevice[] {
    return Array.from(this.devices.values());
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

interface BPRawDevice {
  DeviceIndex: number;
  DeviceName: string;
  DeviceMessages?: {
    LinearCmd?: object;
    FleshlightLaunchFW12Cmd?: object;
  };
}
