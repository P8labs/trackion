(function () {
  if (window.trackion) return;

  const script = document.currentScript;
  if (!script) return;

  const PROJECT_KEY = script.getAttribute("data-api-key");
  if (!PROJECT_KEY) return;

  const BASE = script.src.replace(/\/t\.js.*$/, "");

  const ENDPOINTS = {
    ingest: BASE + "/events/batch",
    config: BASE + "/events/config",
  };

  const STORAGE = {
    session: "trackion.session",
    config: "trackion.config",
  };

  const LIMITS = {
    batch: 20,
    payloadKB: 256,
    flushInterval: 5000,
  };

  const EVENTS = {
    PAGE_VIEW: "page.view",
    PAGE_LEAVE: "page.leave",
    TIME_SPENT: "page.time_spent",
    CLICK: "page.click",
    HEARTBEAT: "session.active",
  };

  let config = {};
  const queue = [];
  const USER_AGENT = navigator.userAgent;

  function uuid() {
    return Math.random().toString(36).slice(2) + Date.now();
  }

  function safeJSONParse(v) {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }

  function getSession() {
    let s = localStorage.getItem(STORAGE.session);
    if (!s) {
      s = uuid();
      localStorage.setItem(STORAGE.session, s);
    }
    return s;
  }

  const sessionId = getSession();

  const utm = (() => {
    const p = new URLSearchParams(location.search);
    return {
      source: p.get("utm_source"),
      medium: p.get("utm_medium"),
      campaign: p.get("utm_campaign"),
    };
  })();

  function buildEvent(name, props, customSessionId) {
    return {
      event: name,
      session_id: customSessionId || sessionId,
      timestamp: new Date().toISOString(),
      user_agent: USER_AGENT,
      page: {
        path: location.pathname,
        title: document.title,
        referrer: document.referrer,
      },
      utm,
      properties: props || {},
    };
  }

  function flush() {
    if (!queue.length) return;

    const batch = queue.splice(0, queue.length);
    const payload = JSON.stringify({
      project_key: PROJECT_KEY,
      events: batch,
    });

    if (payload.length > LIMITS.payloadKB * 1024) {
      console.warn("[trackion] payload too large, dropped");
      return;
    }

    // navigator.sendBeacon?.(
    //   ENDPOINTS.ingest,
    //   new Blob([payload], { type: "application/json" }),
    // ) ||
    fetch(ENDPOINTS.ingest, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Project-Key": PROJECT_KEY,
      },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }

  function enqueue(event) {
    if (queue.length > 1000) return;
    queue.push(event);

    if (queue.length >= LIMITS.batch) {
      flush();
    }
  }

  const api = {
    track(name, properties, sessionOverride) {
      if (!name || typeof name !== "string") return;

      enqueue(buildEvent(name, properties, sessionOverride));
    },

    page(properties) {
      enqueue(buildEvent(EVENTS.PAGE_VIEW, properties));
    },

    event(name, properties) {
      this.track(name, properties);
    },

    identify(userId, traits) {
      enqueue(
        buildEvent("user.identify", {
          user_id: userId,
          traits,
        }),
      );
    },

    flush,

    getSession() {
      return sessionId;
    },

    _queue: queue,
    _config: config,
  };

  window.trackion = api;

  function loadConfig(cb) {
    const cached = safeJSONParse(localStorage.getItem(STORAGE.config));

    if (cached && Date.now() - cached.ts < 3600000) {
      cb(cached.data);
      return;
    }

    fetch(ENDPOINTS.config, {
      headers: { "X-Project-Key": PROJECT_KEY },
    })
      .then((r) => r.json())
      .then((res) => {
        const cfg = res?.data || {};

        localStorage.setItem(
          STORAGE.config,
          JSON.stringify({ ts: Date.now(), data: cfg }),
        );

        if (res?.limits) {
          LIMITS.batch = res.limits.batch_size || LIMITS.batch;
          LIMITS.payloadKB = res.limits.max_payload_kb || LIMITS.payloadKB;
        }

        cb(cfg);
      })
      .catch(() => {
        cb({
          auto_pageview: true,
          track_time_spent: true,
          track_clicks: false,
        });
      });
  }

  loadConfig(function (cfg) {
    config = cfg;
    api._config = cfg;

    if (cfg.auto_pageview) {
      api.page();
    }

    const start = Date.now();

    function onLeave() {
      if (cfg.track_time_spent) {
        api.track(EVENTS.TIME_SPENT, {
          duration_ms: Date.now() - start,
        });
      }

      api.track(EVENTS.PAGE_LEAVE);
      flush();
    }

    window.addEventListener("beforeunload", onLeave);

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        onLeave();
      }
    });

    if (cfg.track_clicks) {
      document.addEventListener("click", function (e) {
        const el = e.target.closest("[data-track]");
        if (!el) return;

        api.track(EVENTS.CLICK, {
          tag: el.tagName,
          id: el.id || null,
          text: (el.innerText || "").slice(0, 50),
        });
      });
    }

    // Send heartbeat every 30 seconds to track as online user
    const heartbeatInterval = setInterval(function () {
      if (document.visibilityState !== "hidden") {
        api.track(EVENTS.HEARTBEAT);
      }
    }, 30000);

    // Cleanup on unload
    window.addEventListener("beforeunload", function () {
      clearInterval(heartbeatInterval);
    });
  });

  setInterval(flush, LIMITS.flushInterval);
})();
