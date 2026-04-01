import {
  type ErrorContext,
  normalizeError,
  generateFingerprint,
  parseStackTrace,
  shouldIgnoreError,
  ErrorDeduplicator,
} from "./errors";
import { getEventDeviceInfo } from "./device";

export type { ErrorContext };
export { type DeviceInfo, getDeviceInfo } from "./device";

export type TrackionJSON =
  | string
  | number
  | boolean
  | null
  | { [key: string]: TrackionJSON }
  | TrackionJSON[];

export interface RuntimePayload {
  flags: Record<string, boolean>;
  config: Record<string, TrackionJSON>;
}

export interface TrackionPageContext {
  path?: string;
  title?: string;
  referrer?: string;
}

export interface TrackionUTMContext {
  source?: string;
  medium?: string;
  campaign?: string;
}

export interface TrackionTrackContext extends TrackionPageContext {
  sessionId?: string;
  utm?: TrackionUTMContext;
}

export interface TrackionPageOptions extends TrackionPageContext {
  utm?: TrackionUTMContext;
  properties?: Record<string, TrackionJSON>;
}

export interface TrackionClientOptions {
  serverUrl: string;
  apiKey: string;
  projectId?: string;
  autoPageview?: boolean;
  batchSize?: number;
  flushIntervalMs?: number;
  sessionId?: string;
  userId?: string;
  runtimeTTLms?: number;
}

export interface RefreshRuntimeOptions {
  force?: boolean;
}

export type RuntimeListener = (runtime: RuntimePayload) => void;

interface RuntimeStorageRecord {
  ts: number;
  data: RuntimePayload;
}

interface EventPayload {
  project_key: string;
  event: string;
  type?: string;
  session_id: string;
  user_id?: string;
  user_agent: string;
  device?: string;
  platform?: string;
  browser?: string;
  page: {
    title: string;
    path: string;
    referrer: string;
  };
  utm: {
    source: string;
    medium: string;
    campaign: string;
  };
  properties: Record<string, TrackionJSON>;
  timestamp: string;
}

const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_FLUSH_INTERVAL_MS = 5000;
const DEFAULT_RUNTIME_TTL_MS = 60_000;
const SESSION_TTL_MS = 30 * 60 * 1000;
const SESSION_STORAGE_KEY = "trackion.session";

const EVENTS = {
  PAGE_VIEW: "page.view",
  PAGE_LEAVE: "page.leave",
  TIME_SPENT: "page.time_spent",
  CLICK: "page.click",
  HEARTBEAT: "session.active",
} as const;

type TrackingConfig = {
  autoPageview: boolean;
  trackTimeSpent: boolean;
  trackClicks: boolean;
};

function randomId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeServerUrl(serverUrl: string): string {
  if (!serverUrl || typeof serverUrl !== "string") {
    throw new Error("Trackion SDK: serverUrl is required");
  }

  return serverUrl.replace(/\/+$/, "");
}

function getOrCreateSessionId(seed?: string): string {
  if (seed && typeof seed === "string") {
    return seed;
  }

  if (typeof localStorage === "undefined") {
    return randomId();
  }

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id?: string; exp?: number } | null;
      if (
        parsed &&
        typeof parsed.id === "string" &&
        typeof parsed.exp === "number" &&
        Date.now() < parsed.exp
      ) {
        return parsed.id;
      }
    }
  } catch {
    // Ignore malformed session cache and recreate below.
  }

  const id = randomId();
  try {
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ id, exp: Date.now() + SESSION_TTL_MS }),
    );
  } catch {
    // Ignore storage write failures.
  }

  return id;
}

function getCurrentPage(): Required<TrackionPageContext> {
  if (typeof window === "undefined") {
    return { path: "", title: "", referrer: "" };
  }

  return {
    path: window.location?.pathname || "",
    title: typeof document !== "undefined" ? document.title || "" : "",
    referrer: typeof document !== "undefined" ? document.referrer || "" : "",
  };
}

function getCurrentUTM(): Required<TrackionUTMContext> {
  if (typeof window === "undefined") {
    return { source: "", medium: "", campaign: "" };
  }

  const params = new URLSearchParams(window.location?.search || "");
  return {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
  };
}

async function postBatch(
  serverUrl: string,
  apiKey: string,
  events: EventPayload[],
  useBeacon: boolean,
): Promise<void> {
  const payload = {
    project_key: apiKey,
    events,
  };

  const endpoint = `${serverUrl}/events/batch`;

  if (
    useBeacon &&
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    navigator.sendBeacon(endpoint, blob);
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Project-Key": apiKey,
    },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  if (!response.ok) {
    throw new Error(
      `Trackion SDK: request failed with status ${response.status}`,
    );
  }
}

export class TrackionClient {
  private readonly apiKey: string;
  private readonly projectId: string;
  private readonly serverUrl: string;
  private readonly autoPageview: boolean;
  private readonly batchSize: number;
  private readonly flushIntervalMs: number;
  private readonly runtimeTTLms: number;
  private readonly runtimeStorageKey: string;

  private userId: string;
  private queue: EventPayload[] = [];
  private sessionId: string;
  private timer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private started = false;
  private flushing = false;
  private pageStartedAt = Date.now();
  private lastLeaveAt = 0;
  private lastHeartbeatAt = 0;

  private runtime: RuntimePayload = {
    flags: {},
    config: {},
  };
  private scriptConfig: Partial<{
    auto_pageview: boolean;
    track_time_spent: boolean;
    track_clicks: boolean;
  }> = {};

  private runtimeFetchedAt = 0;
  private runtimeListeners = new Set<RuntimeListener>();

  private errorDeduplicator = new ErrorDeduplicator(5000);
  private originalOnError: OnErrorEventHandler | null = null;
  private originalOnUnhandledRejection:
    | ((event: PromiseRejectionEvent) => void)
    | null = null;

  constructor(options: TrackionClientOptions) {
    if (!options || typeof options !== "object") {
      throw new Error("Trackion SDK: options are required");
    }

    if (!options.apiKey) {
      throw new Error("Trackion SDK: apiKey is required");
    }

    this.apiKey = options.apiKey;
    this.projectId = options.projectId || "";
    this.serverUrl = normalizeServerUrl(options.serverUrl);
    this.autoPageview = options.autoPageview !== false;
    this.batchSize =
      Number.isInteger(options.batchSize) && (options.batchSize ?? 0) > 0
        ? (options.batchSize as number)
        : DEFAULT_BATCH_SIZE;
    this.flushIntervalMs =
      Number.isInteger(options.flushIntervalMs) &&
      (options.flushIntervalMs ?? 0) > 0
        ? (options.flushIntervalMs as number)
        : DEFAULT_FLUSH_INTERVAL_MS;
    this.runtimeTTLms =
      Number.isInteger(options.runtimeTTLms) && (options.runtimeTTLms ?? 0) > 0
        ? (options.runtimeTTLms as number)
        : DEFAULT_RUNTIME_TTL_MS;
    this.userId =
      typeof options.userId === "string" ? options.userId.trim() : "";

    this.sessionId = getOrCreateSessionId(options.sessionId);
    this.runtimeStorageKey = this.projectId
      ? `trackion.runtime.${this.projectId}`
      : "";

    this._hydrateRuntimeFromStorage();
    this._setupErrorHandlers();
  }

  /**
   * Setup automatic error capture hooks
   * @private
   */
  private _setupErrorHandlers(): void {
    if (typeof window === "undefined") return;

    // Hook window.onerror for uncaught errors
    this.originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      // Capture the error
      void this.captureError(
        error ||
          ({
            message: String(message),
            filename: source,
            lineno,
            colno,
          } as ErrorEvent),
      );

      // Call original handler if it exists
      if (this.originalOnError) {
        return this.originalOnError(message, source, lineno, colno, error);
      }

      return false;
    };

    // Hook window.onunhandledrejection for unhandled promise rejections
    this.originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      // Capture the rejection as an error
      void this.captureError(event.reason);

      // Call original handler if it exists
      if (this.originalOnUnhandledRejection) {
        this.originalOnUnhandledRejection(event);
      }
    };
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    this.pageStartedAt = Date.now();
    this.timer = setInterval(() => {
      this.flush().catch(() => {
        // Ignore transient network errors; events stay queued for later flush.
      });
    }, this.flushIntervalMs);

    if (typeof window !== "undefined") {
      this.heartbeatTimer = setInterval(() => {
        this._sendHeartbeat();
      }, 30_000);

      window.addEventListener("pagehide", this._onPageHide);
      window.addEventListener("beforeunload", this._onPageHide);
      document.addEventListener("visibilitychange", this._onVisibilityChange);
      document.addEventListener("click", this._onTrackedClick);
    }

    if (this._getTrackingConfig().autoPageview) {
      this.page();
    }

    void this.refreshRuntime().catch(() => {
      // Runtime fetch is optional for automatic event flows.
    });
    void this._refreshScriptConfig().catch(() => {
      // Script config endpoint is optional; fallback defaults still apply.
    });
  }

  shutdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (typeof window !== "undefined") {
      window.removeEventListener("pagehide", this._onPageHide);
      window.removeEventListener("beforeunload", this._onPageHide);
      document.removeEventListener(
        "visibilitychange",
        this._onVisibilityChange,
      );
      document.removeEventListener("click", this._onTrackedClick);

      // Restore original error handlers
      if (this.originalOnError !== null) {
        window.onerror = this.originalOnError;
        this.originalOnError = null;
      }
      if (this.originalOnUnhandledRejection !== null) {
        window.onunhandledrejection = this.originalOnUnhandledRejection;
        this.originalOnUnhandledRejection = null;
      }
    }

    this.started = false;
  }

  setSessionId(sessionId: string): void {
    if (!sessionId || typeof sessionId !== "string") {
      throw new Error("Trackion SDK: sessionId must be a non-empty string");
    }

    this.sessionId = sessionId;

    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ id: sessionId, exp: Date.now() + SESSION_TTL_MS }),
        );
      } catch {
        // Ignore storage write failures.
      }
    }
  }

  setUserId(userId: string): void {
    this.userId = typeof userId === "string" ? userId.trim() : "";
  }

  getSessionId(): string {
    return this.sessionId;
  }

  track(
    eventName: string,
    properties: Record<string, TrackionJSON> = {},
    context: TrackionTrackContext = {},
  ): void {
    if (!eventName || typeof eventName !== "string") {
      throw new Error("Trackion SDK: event name must be a non-empty string");
    }

    const page = getCurrentPage();
    const utm = getCurrentUTM();
    const deviceInfo = getEventDeviceInfo();

    // Merge user properties with device information
    const enrichedProperties = {
      ...deviceInfo,
      tz:
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone || ""
          : "",
      ...properties, // User properties take precedence
    };

    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";

    this._enqueue({
      project_key: this.apiKey,
      event: eventName,
      session_id: context.sessionId || this.sessionId,
      user_id: this.userId || undefined,
      user_agent: userAgent,
      device: String(deviceInfo.device || ""),
      platform: String(deviceInfo.platform || ""),
      browser: String(deviceInfo.browser || ""),
      page: {
        title: context.title || page.title,
        path: context.path || page.path,
        referrer: context.referrer || page.referrer,
      },
      utm: {
        source: context.utm?.source || utm.source,
        medium: context.utm?.medium || utm.medium,
        campaign: context.utm?.campaign || utm.campaign,
      },
      properties: enrichedProperties,
      timestamp: new Date().toISOString(),
    });
  }

  page(data: TrackionPageOptions = {}): void {
    const page = getCurrentPage();
    const utm = getCurrentUTM();
    const deviceInfo = getEventDeviceInfo();

    // Merge user properties with device information
    const enrichedProperties = {
      ...deviceInfo,
      tz:
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone || ""
          : "",
      ...(data.properties || {}), // User properties take precedence
    };

    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";

    this._enqueue({
      project_key: this.apiKey,
      event: EVENTS.PAGE_VIEW,
      session_id: this.sessionId,
      user_id: this.userId || undefined,
      user_agent: userAgent,
      device: String(deviceInfo.device || ""),
      platform: String(deviceInfo.platform || ""),
      browser: String(deviceInfo.browser || ""),
      page: {
        title: data.title || page.title,
        path: data.path || page.path,
        referrer: data.referrer || page.referrer,
      },
      utm: {
        source: data.utm?.source || utm.source,
        medium: data.utm?.medium || utm.medium,
        campaign: data.utm?.campaign || utm.campaign,
      },
      properties: enrichedProperties,
      timestamp: new Date().toISOString(),
    });
  }

  identify(userId: string, traits: Record<string, TrackionJSON> = {}): void {
    this.track("user.identify", { user_id: userId, traits });
  }

  /**
   * Capture an error for error tracking
   * @param error - Error object, string, or ErrorEvent
   * @param context - Additional context data
   */
  async captureError(
    error: Error | string | ErrorEvent | unknown,
    context: ErrorContext = {},
  ): Promise<void> {
    try {
      // Normalize the error
      const normalized = normalizeError(error);

      // Check if we should ignore this error
      if (shouldIgnoreError(normalized)) {
        return;
      }

      // Generate fingerprint for grouping
      const fingerprint = await generateFingerprint(
        normalized.message,
        normalized.stack,
      );

      // Check if this is a duplicate within the deduplication window
      if (!this.errorDeduplicator.shouldCapture(fingerprint)) {
        return;
      }

      // Parse stack trace for file location
      const location = parseStackTrace(normalized.stack);

      // Get current page URL
      const url =
        typeof window !== "undefined" ? window.location.href : "unknown";

      // Build error metadata
      const errorMetadata: Record<string, TrackionJSON> = {
        error_message: normalized.message,
        stack_trace: normalized.stack,
        fingerprint: fingerprint,
        url: url,
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      };

      // Add line/column numbers if available
      if (normalized.lineno !== undefined || location?.line !== undefined) {
        errorMetadata.line_number = normalized.lineno || location?.line || 0;
      }
      if (normalized.colno !== undefined || location?.column !== undefined) {
        errorMetadata.column_number = normalized.colno || location?.column || 0;
      }

      // Add custom context
      if (Object.keys(context).length > 0) {
        errorMetadata.context = context;
      }

      // Track the error event with type="error"
      const page = getCurrentPage();
      const utm = getCurrentUTM();
      const deviceInfo = getEventDeviceInfo();

      // Merge device info with error metadata
      const enrichedErrorMetadata = {
        ...deviceInfo,
        ...errorMetadata, // Error metadata takes precedence
      };

      const userAgent =
        typeof navigator !== "undefined" ? navigator.userAgent : "";

      this._enqueue({
        project_key: this.apiKey,
        event: "error",
        type: "error",
        session_id: this.sessionId,
        user_id: this.userId || undefined,
        user_agent: userAgent,
        device: String(deviceInfo.device || ""),
        platform: String(deviceInfo.platform || ""),
        browser: String(deviceInfo.browser || ""),
        page: {
          title: page.title,
          path: page.path,
          referrer: page.referrer,
        },
        utm: {
          source: utm.source,
          medium: utm.medium,
          campaign: utm.campaign,
        },
        properties: enrichedErrorMetadata,
        timestamp: new Date().toISOString(),
      });
    } catch (captureError) {
      // Never throw errors from error capture - fail silently
      console.error("[Trackion] Failed to capture error:", captureError);
    }
  }

  async flush({
    useBeacon = false,
  }: { useBeacon?: boolean } = {}): Promise<void> {
    if (this.flushing || this.queue.length === 0) {
      return;
    }

    this.flushing = true;
    const chunk = this.queue.slice(0, this.batchSize);

    try {
      await postBatch(this.serverUrl, this.apiKey, chunk, useBeacon);
      this.queue.splice(0, chunk.length);
    } finally {
      this.flushing = false;
    }
  }

  async refreshRuntime({
    force = false,
  }: RefreshRuntimeOptions = {}): Promise<RuntimePayload> {
    const now = Date.now();
    if (!force && now - this.runtimeFetchedAt < this.runtimeTTLms) {
      return this.runtime;
    }

    const runtimeUrl = new URL(`${this.serverUrl}/v1/runtime`);

    if (this.userId) {
      runtimeUrl.searchParams.set("user_id", this.userId);
    }

    const response = await fetch(runtimeUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Trackion SDK: runtime request failed with status ${response.status}`,
      );
    }

    const payload: { status?: boolean; data?: RuntimePayload } =
      await response.json();
    if (!payload.status) {
      throw new Error("Trackion SDK: runtime response is invalid");
    }

    const data = payload.data || { flags: {}, config: {} };
    this.runtime = {
      flags: data.flags || {},
      config: data.config || {},
    };

    this.runtimeFetchedAt = now;
    this._persistRuntimeToStorage();
    this._emitRuntimeUpdate();

    return this.runtime;
  }

  subscribeRuntime(listener: RuntimeListener): () => void {
    this.runtimeListeners.add(listener);
    return () => {
      this.runtimeListeners.delete(listener);
    };
  }

  isEnabled(flagKey: string): boolean {
    return Boolean(this.runtime.flags?.[flagKey]);
  }

  getConfig<T extends TrackionJSON = TrackionJSON>(
    configKey: string,
    fallback?: T,
  ): T | undefined {
    if (Object.prototype.hasOwnProperty.call(this.runtime.config, configKey)) {
      return this.runtime.config[configKey] as T;
    }

    return fallback;
  }

  getRuntimeSnapshot(): RuntimePayload {
    return {
      flags: { ...this.runtime.flags },
      config: { ...this.runtime.config },
    };
  }

  private _enqueue(event: EventPayload): void {
    this.queue.push(event);

    if (this.queue.length >= this.batchSize) {
      void this.flush();
    }
  }

  private _onPageHide = (): void => {
    this._trackPageLeave();
    void this.flush({ useBeacon: true });
  };

  private _onVisibilityChange = (): void => {
    if (typeof document === "undefined") {
      return;
    }

    if (document.visibilityState === "hidden") {
      this._trackPageLeave();
      void this.flush({ useBeacon: true });
    }
  };

  private _onTrackedClick = (event: MouseEvent): void => {
    const cfg = this._getTrackingConfig();
    if (!cfg.trackClicks) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const el = target.closest("[data-track]") as HTMLElement | null;
    if (!el) {
      return;
    }

    this.track(EVENTS.CLICK, {
      tag: el.tagName,
      id: el.id || null,
      text: (el.innerText || "").slice(0, 50),
    });
  };

  private _trackPageLeave(): void {
    const now = Date.now();
    if (now - this.lastLeaveAt < 1000) {
      return;
    }

    const cfg = this._getTrackingConfig();
    if (cfg.trackTimeSpent) {
      this.track(EVENTS.TIME_SPENT, {
        duration_ms: now - this.pageStartedAt,
      });
    }

    this.track(EVENTS.PAGE_LEAVE);

    this.lastLeaveAt = now;
    this.pageStartedAt = now;
  }

  private _sendHeartbeat(): void {
    if (
      typeof document !== "undefined" &&
      document.visibilityState === "hidden"
    ) {
      return;
    }

    const now = Date.now();
    if (now - this.lastHeartbeatAt < 25_000) {
      return;
    }

    this.lastHeartbeatAt = now;
    this.track(EVENTS.HEARTBEAT);
  }

  private _readBooleanConfig(keys: string[], fallback: boolean): boolean {
    const scriptCfg = this.scriptConfig as Record<string, unknown>;

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(scriptCfg, key)) {
        const value = scriptCfg[key];
        if (typeof value === "boolean") {
          return value;
        }
      }
    }

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(this.runtime.config, key)) {
        const value = this.runtime.config[key];
        if (typeof value === "boolean") {
          return value;
        }
        if (typeof value === "string") {
          const normalized = value.toLowerCase().trim();
          if (normalized === "true") return true;
          if (normalized === "false") return false;
        }
      }
    }

    return fallback;
  }

  private _getTrackingConfig(): TrackingConfig {
    return {
      autoPageview:
        this.autoPageview && this._readBooleanConfig(["auto_pageview"], true),
      trackTimeSpent: this._readBooleanConfig(
        ["track_time_spent", "time_spent"],
        true,
      ),
      trackClicks: this._readBooleanConfig(["track_clicks", "clicks"], false),
    };
  }

  private async _refreshScriptConfig(): Promise<void> {
    const response = await fetch(`${this.serverUrl}/events/config`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Project-Key": this.apiKey,
      },
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as {
      data?: {
        auto_pageview?: boolean;
        track_time_spent?: boolean;
        track_clicks?: boolean;
      };
    };

    if (!payload || !payload.data) {
      return;
    }

    this.scriptConfig = {
      auto_pageview: payload.data.auto_pageview,
      track_time_spent: payload.data.track_time_spent,
      track_clicks: payload.data.track_clicks,
    };
  }

  private _hydrateRuntimeFromStorage(): void {
    if (!this.runtimeStorageKey || typeof localStorage === "undefined") {
      return;
    }

    try {
      const raw = localStorage.getItem(this.runtimeStorageKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as RuntimeStorageRecord | null;
      if (!parsed || typeof parsed !== "object") {
        return;
      }

      if (typeof parsed.ts === "number") {
        this.runtimeFetchedAt = parsed.ts;
      }

      if (parsed.data && typeof parsed.data === "object") {
        this.runtime = {
          flags: parsed.data.flags || {},
          config: parsed.data.config || {},
        };
      }
    } catch {
      // Ignore invalid local cache and proceed.
    }
  }

  private _persistRuntimeToStorage(): void {
    if (!this.runtimeStorageKey || typeof localStorage === "undefined") {
      return;
    }

    try {
      const payload: RuntimeStorageRecord = {
        ts: this.runtimeFetchedAt,
        data: this.runtime,
      };
      localStorage.setItem(this.runtimeStorageKey, JSON.stringify(payload));
    } catch {
      // Ignore storage write errors (quota/private mode).
    }
  }

  private _emitRuntimeUpdate(): void {
    const snapshot = this.getRuntimeSnapshot();
    this.runtimeListeners.forEach((listener) => listener(snapshot));
  }
}

export function createTrackionClient(
  options: TrackionClientOptions,
): TrackionClient {
  const client = new TrackionClient(options);
  client.start();
  return client;
}
