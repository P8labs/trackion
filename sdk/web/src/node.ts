import {
  createTrackionClient,
  TrackionClient,
  type RuntimePayload,
  type RefreshRuntimeOptions,
  type TrackionClientOptions,
  type TrackionJSON,
  type TrackionTrackContext,
} from "./core";

export interface TrackionNodeClientOptions extends TrackionClientOptions {
  autoPageview?: false;
}

export function createTrackionNodeClient(
  options: TrackionNodeClientOptions,
): TrackionClient {
  return createTrackionClient({
    ...options,
    autoPageview: false,
  });
}

export function trackServerEvent(
  client: TrackionClient,
  eventName: string,
  properties: Record<string, TrackionJSON> = {},
  context: TrackionTrackContext = {},
): void {
  client.track(eventName, properties, context);
}

export async function refreshNodeRuntime(
  client: TrackionClient,
  options: RefreshRuntimeOptions = {},
): Promise<RuntimePayload> {
  return client.refreshRuntime(options);
}

export {
  TrackionClient,
  type TrackionClientOptions,
  type TrackionJSON,
  type TrackionTrackContext,
  type RuntimePayload,
  type RefreshRuntimeOptions,
} from "./core";
