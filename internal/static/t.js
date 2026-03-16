(function () {

  const script = document.currentScript;
  if (!script) return;

  const projectKey = script.getAttribute("data-project");
  if (!projectKey) return;

  const base = script.src.replace(/\/t\.js.*$/, "");
  const ingestURL = base + "/events/batch";
  const configURL = base + "/events/config?key=" + encodeURIComponent(projectKey);

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
      campaign: p.get("utm_campaign")
    };
  })();

  function baseEvent(name, props) {
    return {
      event: name,
      sessionId,
      timestamp: Date.now(),
      page: {
        path: location.pathname,
        referrer: document.referrer
      },
      utm: utmParams,
      properties: props || {}
    };
  }

  function sendBatch() {

    if (!queue.length) return;

    const payloadObj = {
      projectKey,
      events: queue.splice(0, queue.length)
    };

    const payload = JSON.stringify(payloadObj);

    if (payload.length > MAX_PAYLOAD_KB * 1024) {
      console.warn("Trackion payload too large, dropping batch");
      return;
    }

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ingestURL, payload);
    } else {
      fetch(ingestURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true
      }).catch(function () {});
    }
  }

  function track(name, props) {

    queue.push(baseEvent(name, props));

    if (queue.length >= MAX_BATCH) {
      sendBatch();
    }

  }

  window.trackion = track;

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

    fetch(configURL)
      .then(r => r.json())
      .then(cfg => {

        try {
          localStorage.setItem(CONFIG_KEY, JSON.stringify({
            ts: Date.now(),
            cfg
          }));
        } catch (e) {}

        if (cfg.limits) {
          MAX_BATCH = cfg.limits.batch_size || MAX_BATCH;
          MAX_PAYLOAD_KB = cfg.limits.max_payload_kb || MAX_PAYLOAD_KB;
        }

        cb(cfg);

      })
      .catch(() => {
        cb({
          auto_pageview: true,
          time_spent: true,
          campaign: true,
          clicks: false
        });
      });
  }

  loadConfig(function (cfg) {

    if (cfg.auto_pageview) {
      track("pageview");
    }

    if (cfg.time_spent) {

      const start = Date.now();

      function report() {
        track("time_spent", {
          duration_ms: Date.now() - start
        });
        sendBatch();
      }

      window.addEventListener("beforeunload", report);

      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") report();
      });

    }

    if (cfg.clicks) {

      document.addEventListener("click", function (e) {

        const el = e.target.closest("[data-track]");
        if (!el) return;

        track("click", {
          element: el.tagName,
          id: el.id || null,
          text: (el.innerText || "").slice(0, 50)
        });

      });

    }

  });

  setInterval(sendBatch, FLUSH_INTERVAL);

})();