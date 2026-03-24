const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_FLUSH_INTERVAL_MS = 5000;

function randomId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeServerUrl(serverUrl) {
  if (!serverUrl || typeof serverUrl !== "string") {
    throw new Error("Trackion SDK: serverUrl is required");
  }

  return serverUrl.replace(/\/+$/, "");
}

function getCurrentPage() {
  if (typeof window === "undefined") {
    return { path: "", title: "", referrer: "" };
  }

  return {
    path: window.location?.pathname || "",
    title: typeof document !== "undefined" ? document.title || "" : "",
    referrer: typeof document !== "undefined" ? document.referrer || "" : "",
  };
}

function getCurrentUTM() {
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

async function postBatch(serverUrl, projectKey, events, useBeacon) {
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

class TrackionClient {
  constructor(options) {
    if (!options || typeof options !== "object") {
      throw new Error("Trackion SDK: options are required");
    }

    if (!options.projectKey) {
      throw new Error("Trackion SDK: projectKey is required");
    }

    this.projectKey = options.projectKey;
    this.serverUrl = normalizeServerUrl(options.serverUrl);
    this.autoPageview = options.autoPageview !== false;
    this.batchSize =
      Number.isInteger(options.batchSize) && options.batchSize > 0
        ? options.batchSize
        : DEFAULT_BATCH_SIZE;
    this.flushIntervalMs =
      Number.isInteger(options.flushIntervalMs) && options.flushIntervalMs > 0
        ? options.flushIntervalMs
        : DEFAULT_FLUSH_INTERVAL_MS;

    this.queue = [];
    this.sessionId = options.sessionId || randomId();
    this.timer = null;
    this.started = false;
    this.flushing = false;

    this._onPageHide = this._onPageHide.bind(this);
  }

  start() {
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
  }

  shutdown() {
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

  setSessionId(sessionId) {
    if (!sessionId || typeof sessionId !== "string") {
      throw new Error("Trackion SDK: sessionId must be a non-empty string");
    }

    this.sessionId = sessionId;
  }

  page(data = {}) {
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

  track(eventName, properties = {}, context = {}) {
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

  async flush({ useBeacon = false } = {}) {
    if (this.flushing || this.queue.length === 0) return;

    this.flushing = true;

    const chunk = this.queue.slice(0, this.batchSize);

    try {
      await postBatch(this.serverUrl, this.projectKey, chunk, useBeacon);
      this.queue.splice(0, chunk.length);
    } finally {
      this.flushing = false;
    }
  }

  _enqueue(event) {
    this.queue.push(event);

    if (this.queue.length >= this.batchSize) {
      this.flush().catch(() => {
        // Keep queued events for the next attempt.
      });
    }
  }

  _onPageHide() {
    this.flush({ useBeacon: true }).catch(() => {
      // Intentionally ignore errors during page unload.
    });
  }
}

export function createTrackionClient(options) {
  const client = new TrackionClient(options);
  client.start();
  return client;
}

export { TrackionClient };
