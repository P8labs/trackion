import {
  inject,
  onScopeDispose,
  provide,
  ref,
  shallowRef,
  type ShallowRef,
  type InjectionKey,
  type Ref,
} from "vue";
import {
  createTrackionClient,
  type TrackionClient,
  type TrackionClientOptions,
  type TrackionJSON,
  type RuntimePayload,
} from "./core";

export const TRACKION_KEY: InjectionKey<TrackionClient> =
  Symbol("trackion-client");

export function createVueTrackion(
  options: TrackionClientOptions,
): TrackionClient {
  return createTrackionClient(options);
}

export function provideTrackion(client: TrackionClient): void {
  provide(TRACKION_KEY, client);
}

export function useTrackion(): TrackionClient {
  const client = inject(TRACKION_KEY);
  if (!client) {
    throw new Error(
      "Trackion client is not provided. Call provideTrackion(client) first.",
    );
  }
  return client;
}

export function useFeatureFlag(flagKey: string): Ref<boolean> {
  const client = useTrackion();
  const value = ref(client.isEnabled(flagKey));
  const unsubscribe = client.subscribeRuntime((runtime) => {
    value.value = Boolean(runtime.flags[flagKey]);
  });
  onScopeDispose(unsubscribe);
  return value;
}

export function useRemoteConfig<T extends TrackionJSON = TrackionJSON>(
  configKey: string,
  fallback?: T,
): ShallowRef<T | undefined> {
  const client = useTrackion();
  const value = shallowRef(
    client.getConfig<T>(configKey, fallback) as T | undefined,
  ) as ShallowRef<T | undefined>;
  const unsubscribe = client.subscribeRuntime((runtime) => {
    if (Object.prototype.hasOwnProperty.call(runtime.config, configKey)) {
      value.value = runtime.config[configKey] as T;
    } else {
      value.value = fallback;
    }
  });
  onScopeDispose(unsubscribe);
  return value;
}

export async function refreshTrackionRuntime(
  client: TrackionClient,
): Promise<RuntimePayload> {
  return client.refreshRuntime({ force: true });
}
