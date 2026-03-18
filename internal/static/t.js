(function () {
  const script = document.currentScript;
  if (!script) return;

  const projectKey = script.getAttribute("data-project");
  if (!projectKey) return;

  const base = script.src.replace(/\/t\.js.*$/, "");
  const USER_AGENT = navigator.userAgent;
  const ingestURL = base + "/events/batch";
  const configURL =
    base + "/events/config?key=" + encodeURIComponent(projectKey);

  const SESSION_KEY = "trackion_session";
  const CONFIG_KEY = "trackion_cfg";

  let MAX_BATCH = 10;
  let MAX_PAYLOAD_KB = 256;

  const FLUSH_INTERVAL = 5000;

  function uuid() {
    return Math.random().toString(36).slice(2) + Date.now();
  }

  function getSession() {
    let s = localStorage.getItem(SESSION_KEY);
    if (!s) {
      s = uuid();
      localStorage.setItem(SESSION_KEY, s);
    }
    return s;
  }

  const sessionId = getSession();
  const queue = [];

  const utmParams = (function () {
    const p = new URLSearchParams(location.search);
    return {
      source: p.get("utm_source"),
      medium: p.get("utm_medium"),
      campaign: p.get("utm_campaign"),
    };
  })();

  function baseEvent(name, props, customSessionId) {
    return {
      event: name,
      sessionId: customSessionId || sessionId,
      timestamp: new Date().toISOString(),
      userAgent: USER_AGENT,
      page: {
        path: location.pathname,
        title: document.title,
        referrer: document.referrer,
      },
      utm: utmParams,
      properties: props || {},
    };
  }

  function sendBatch() {
    if (!queue.length) return;

    const events = queue.splice(0, queue.length);
    const payload = JSON.stringify(events);

    if (payload.length > MAX_PAYLOAD_KB * 1024) {
      console.warn("Trackion payload too large, dropping batch");
      return;
    }

    fetch(ingestURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Project-Key": projectKey,
      },
      body: payload,
      keepalive: true,
    }).catch(function (err) {
      console.warn("Trackion: Failed to send events", err);
    });
  }

  function track(name, props, customSessionId) {
    queue.push(baseEvent(name, props, customSessionId));

    if (queue.length >= MAX_BATCH) {
      sendBatch();
    }
  }

  // Enhanced API object with additional methods
  const trackionAPI = {
    track: track,
    
    // Convenience methods
    page: function(properties) {
      track('page_view', properties);
    },
    
    event: function(eventName, properties) {
      track(eventName, properties);
    },
    
    // Access to configuration and state
    config: {},
    session: sessionId,
    queue: queue,
    
    // Manual batch sending
    flush: function() {
      sendBatch();
    }
  };

  window.trackion = trackionAPI;

  function loadConfig(cb) {
    try {
      const cached = localStorage.getItem(CONFIG_KEY);

      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.ts < 3600000) {
          cb(data.cfg);
          return;
        }
      }
    } catch (e) {}

    fetch(configURL, {
      headers: {
        "Content-Type": "application/json",
        "X-Project-Key": projectKey,
      },
    })
      .then((r) => r.json())
      .then((cfg) => {
        try {
          if (!cfg.status) {
            throw Error("Failed to fetch config");
          }
          localStorage.setItem(
            CONFIG_KEY,
            JSON.stringify({
              ts: Date.now(),
              cfg: cfg.data,
            }),
          );
        } catch (e) {
          localStorage.removeItem(CONFIG_KEY);
        }

        if (cfg.limits) {
          MAX_BATCH = cfg.limits.batch_size || MAX_BATCH;
          MAX_PAYLOAD_KB = cfg.limits.max_payload_kb || MAX_PAYLOAD_KB;
        }

        cb(cfg);
      })
      .catch(() => {
        cb({
          auto_pageview: true,
          track_time_spent: true,
          track_campaign: true,
          track_clicks: false,
        });
      });
  }

  loadConfig(function (cfg) {
    // Store config in API object
    trackionAPI.config = cfg;
    
    if (cfg.auto_pageview) {
      track("pageview");
    }

    const start = Date.now();

    function report() {
      if (cfg.track_time_spent) {
        track("time_spent", {
          duration_ms: Date.now() - start,
        });
      }
      track("pageleave");

      sendBatch();
    }
    window.addEventListener("beforeunload", report);

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") report();
    });

    if (cfg.track_clicks) {
      document.addEventListener("click", function (e) {
        const el = e.target.closest("[data-track]");
        if (!el) return;

        track("click", {
          element: el.tagName,
          id: el.id || null,
          text: (el.innerText || "").slice(0, 50),
        });
      });
    }
  });

  setInterval(sendBatch, FLUSH_INTERVAL);
})();
