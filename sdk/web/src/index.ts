export {
  createTrackionClient,
  TrackionClient,
  type TrackionClientOptions,
  type TrackionJSON,
  type TrackionTrackContext,
  type TrackionPageOptions,
  type RuntimePayload,
  type RuntimeListener,
  type RefreshRuntimeOptions,
  type DeviceInfo,
  getDeviceInfo,
} from "./core";

export {
  type ErrorContext,
  type NormalizedError,
  generateFingerprint,
  normalizeError,
  parseStackTrace,
  shouldIgnoreError,
  ErrorDeduplicator,
} from "./errors";

export {
  getEventDeviceInfo,
} from "./device";
