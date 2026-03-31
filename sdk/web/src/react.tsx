import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createTrackionClient,
  TrackionClient,
  type RuntimePayload,
  type TrackionClientOptions,
  type TrackionJSON,
} from "./core";

const TrackionContext = createContext<TrackionClient | null>(null);

export interface TrackionProviderProps {
  options: TrackionClientOptions;
  children: ReactNode;
}

export function TrackionProvider({ options, children }: TrackionProviderProps) {
  const clientRef = useRef<TrackionClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = createTrackionClient(options);
  }

  useEffect(() => {
    return () => {
      clientRef.current?.shutdown();
    };
  }, []);

  return (
    <TrackionContext.Provider value={clientRef.current}>
      {children}
    </TrackionContext.Provider>
  );
}

export function useTrackion(): TrackionClient {
  const client = useContext(TrackionContext);
  if (!client) {
    throw new Error("useTrackion must be used inside <TrackionProvider>");
  }
  return client;
}

export function useFeatureFlag(flagKey: string): boolean {
  const client = useTrackion();
  const [enabled, setEnabled] = useState(() => client.isEnabled(flagKey));

  useEffect(() => {
    setEnabled(client.isEnabled(flagKey));
    const unsubscribe = client.subscribeRuntime((runtime) => {
      setEnabled(Boolean(runtime.flags[flagKey]));
    });
    return unsubscribe;
  }, [client, flagKey]);

  return enabled;
}

export function useRemoteConfig<T extends TrackionJSON = TrackionJSON>(
  configKey: string,
  fallback?: T,
): T | undefined {
  const client = useTrackion();
  const [value, setValue] = useState<T | undefined>(() =>
    client.getConfig<T>(configKey, fallback),
  );

  useEffect(() => {
    setValue(client.getConfig<T>(configKey, fallback));
    const unsubscribe = client.subscribeRuntime((runtime) => {
      if (Object.prototype.hasOwnProperty.call(runtime.config, configKey)) {
        setValue(runtime.config[configKey] as T);
      } else {
        setValue(fallback);
      }
    });
    return unsubscribe;
  }, [client, configKey, fallback]);

  return value;
}

export async function refreshTrackionRuntime(
  client: TrackionClient,
): Promise<RuntimePayload> {
  return client.refreshRuntime({ force: true });
}
