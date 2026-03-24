# Trackion JavaScript SDK

Official JavaScript SDK for sending analytics events to Trackion.

## Install

```bash
npm install @trackion/javascript-sdk
```

## Quick Start

```javascript
import { createTrackionClient } from "@trackion/javascript-sdk";

const trackion = createTrackionClient({
  serverUrl: "https://your-trackion-server.com",
  projectKey: "your-project-api-key",
  autoPageview: true,
});

trackion.track("signup_started", {
  source: "landing",
  plan: "pro",
});
```

## API

### createTrackionClient(options)

Creates and starts a client.

Options:

- `serverUrl` (string, required): Trackion server base URL.
- `projectKey` (string, required): Project API key.
- `autoPageview` (boolean, optional, default `true`): Send `page.view` on start.
- `batchSize` (number, optional, default `20`): Events per request.
- `flushIntervalMs` (number, optional, default `5000`): Flush interval.
- `sessionId` (string, optional): Custom session ID.

### client.track(eventName, properties?, context?)

Tracks a custom event.

```javascript
trackion.track("button_clicked", { cta: "pricing" }, { path: "/pricing" });
```

### client.page(data?)

Tracks a `page.view` event.

```javascript
trackion.page();
```

### client.flush()

Flushes queued events immediately.

### client.setSessionId(sessionId)

Updates session ID for future events.

### client.shutdown()

Stops timers and unload listeners.

## Notes

- Events are sent to `POST /events/batch`.
- The SDK sends `X-Project-Key` and `project_key` payload fields.
- During page unload, the SDK uses `navigator.sendBeacon` when available.
