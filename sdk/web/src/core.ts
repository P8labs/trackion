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
  projectKey: string;
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
  userId?: string;
}

export type RuntimeListener = (runtime: RuntimePayload) => void;

interface RuntimeStorageRecord {
  ts: number;
  data: RuntimePayload;
}

interface EventPayload {
  event: string;
  session_Id: string;
  page: {
    path: string;
    title: string;
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
  projectKey: string,
  events: EventPayload[],
  useBeacon: boolean,
): Promise<void> {
  const payload = {
    project_key: projectKey,
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
      "X-Project-Key": projectKey,
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
  private readonly projectKey: string;
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
  private started = false;
  private flushing = false;

  private runtime: RuntimePayload = {
    flags: {},
    config: {},
  };

  private runtimeFetchedAt = 0;
  private runtimeListeners = new Set<RuntimeListener>();

  constructor(options: TrackionClientOptions) {
    if (!options || typeof options !== "object") {
      throw new Error("Trackion SDK: options are required");
    }

    if (!options.projectKey) {
      throw new Error("Trackion SDK: projectKey is required");
    }

    this.projectKey = options.projectKey;
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

    this.sessionId = options.sessionId || randomId();
    this.runtimeStorageKey = this.projectId
      ? `trackion.runtime.${this.projectId}`
      : "";

    this._hydrateRuntimeFromStorage();

    this._onPageHide = this._onPageHide.bind(this);
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    this.timer = setInterval(() => {
      this.flush().catch(() => {
        // Ignore transient network errors; events stay queued for later flush.
      });
    }, this.flushIntervalMs);

    if (typeof window !== "undefined") {
      window.addEventListener("pagehide", this._onPageHide);
      window.addEventListener("beforeunload", this._onPageHide);
    }

    if (this.autoPageview) {
      this.page();
    }

    void this.refreshRuntime();
  }

  shutdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (typeof window !== "undefined") {
      window.removeEventListener("pagehide", this._onPageHide);
      window.removeEventListener("beforeunload", this._onPageHide);
    }

    this.started = false;
  }

  setSessionId(sessionId: string): void {
    if (!sessionId || typeof sessionId !== "string") {
      throw new Error("Trackion SDK: sessionId must be a non-empty string");
    }

    this.sessionId = sessionId;
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

    this._enqueue({
      event: eventName,
      session_Id: context.sessionId || this.sessionId,
      page: {
        path: context.path || page.path,
        title: context.title || page.title,
        referrer: context.referrer || page.referrer,
      },
      utm: {
        source: context.utm?.source || utm.source,
        medium: context.utm?.medium || utm.medium,
        campaign: context.utm?.campaign || utm.campaign,
      },
      properties,
      timestamp: new Date().toISOString(),
    });
  }

  page(data: TrackionPageOptions = {}): void {
    const page = getCurrentPage();
    const utm = getCurrentUTM();

    this._enqueue({
      event: "page.view",
      session_Id: this.sessionId,
      page: {
        path: data.path || page.path,
        title: data.title || page.title,
        referrer: data.referrer || page.referrer,
      },
      utm: {
        source: data.utm?.source || utm.source,
        medium: data.utm?.medium || utm.medium,
        campaign: data.utm?.campaign || utm.campaign,
      },
      properties: data.properties || {},
      timestamp: new Date().toISOString(),
    });
  }

  identify(userId: string, traits: Record<string, TrackionJSON> = {}): void {
    this.track("user.identify", { user_id: userId, traits });
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
      await postBatch(this.serverUrl, this.projectKey, chunk, useBeacon);
      this.queue.splice(0, chunk.length);
    } finally {
      this.flushing = false;
    }
  }

  async refreshRuntime({
    force = false,
    userId,
  }: RefreshRuntimeOptions = {}): Promise<RuntimePayload> {
    if (!this.projectId) {
      return this.runtime;
    }

    const now = Date.now();
    if (!force && now - this.runtimeFetchedAt < this.runtimeTTLms) {
      return this.runtime;
    }

    const runtimeUrl = new URL(`${this.serverUrl}/v1/runtime`);
    runtimeUrl.searchParams.set("project_id", this.projectId);

    const effectiveUserId =
      typeof userId === "string" && userId.trim() ? userId.trim() : this.userId;
    if (effectiveUserId) {
      runtimeUrl.searchParams.set("user_id", effectiveUserId);
    }

    const response = await fetch(runtimeUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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

  private _onPageHide(): void {
    void this.flush({ useBeacon: true });
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
