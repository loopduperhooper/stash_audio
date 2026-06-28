import * as GQL from "src/core/generated-graphql";

export interface IDeviceSettings {
  connectionKey: string;
  scriptOffset: number;
  estimatedServerTimeOffset?: number;
  useStashHostedFunscript?: boolean;
  [key: string]: unknown;
}

export interface IInteractiveClientProviderOptions {
  handyKey: string;
  scriptOffset: number;
  defaultClientProvider?: IInteractiveClientProvider;
  stashConfig?: GQL.ConfigDataFragment;
}
export interface IInteractiveClientProvider {
  (options: IInteractiveClientProviderOptions): IInteractiveClient;
}

/**
 * Interface that is used for InteractiveProvider
 */
export interface IInteractiveClient {
  connect(): Promise<void>;
  handyKey: string;
  uploadScript: (funscriptPath: string, apiKey?: string) => Promise<void>;
  sync(): Promise<number>;
  configure(config: Partial<IDeviceSettings>): Promise<void>;
  play(position: number): Promise<void>;
  pause(): Promise<void>;
  ensurePlaying(position: number): Promise<void>;
  setLooping(looping: boolean): Promise<void>;
  readonly connected: boolean;
  readonly playing: boolean;
}

export interface IInteractiveUtils {
  getPlayer: () => undefined;
  interactiveClientProvider: IInteractiveClientProvider | undefined;
}
const InteractiveUtils: IInteractiveUtils = {
  interactiveClientProvider: undefined,
  getPlayer: () => undefined,
};

export default InteractiveUtils;
