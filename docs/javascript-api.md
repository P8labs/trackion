# JavaScript API

Trackion supports both:

- NPM SDK package family (`@trackion/js`)
- Hosted tracker script (`/t.js`)

Official package: [@trackion/js on npm](https://www.npmjs.com/package/@trackion/js)

## NPM SDK Quick Start

Install:

```bash
npm install @trackion/js
```

Vanilla usage:

```ts
import { createTrackionClient } from "@trackion/js";

const trackion = createTrackionClient({
  serverUrl: "https://your-trackion-server.com",
  apiKey: "PROJECT_API_KEY",
  userId: "user-123",
});

trackion.track("signup.started", { source: "landing" });
await trackion.refreshRuntime();
```

Framework entrypoints:

- `@trackion/js/react`
- `@trackion/js/vue`
- `@trackion/js/node`

See [SDK Usage](/sdk-usage) for full examples.

## Script Setup

Add in &lt;head&gt;:

```html
<script
  src="https://your-trackion-server.com/t.js"
  data-api-key="your-project-api-key"
></script>
```

Variants:

- /t.js
- /t.min.js

The tracker:

- Loads project config from /events/config
- Sends events to /events/batch
- Authenticates ingestion with X-Project-Key

Runtime control:

- Clients can fetch evaluated flags/config from /v1/runtime
- Dashboard users manage values in project Runtime Control sections

## What Is Auto-Tracked

Depending on project settings, the tracker can collect:

- Page views
- Session-based activity
- Referrer and campaign data
- Time-spent and click signals (when enabled)

## Manual Event Tracking

The global object is trackion.

```javascript
trackion.track("signup_started", {
  source: "landing",
  plan: "pro",
});
```

## Backend-to-Trackion Event Ingestion

Use ingestion endpoints directly from your backend jobs/services.

```bash
curl -X POST https://your-trackion-server.com/events/batch \
  -H "Content-Type: application/json" \
  -H "X-Project-Key: your-project-api-key" \
  -d '{
    "project_key": "your-project-api-key",
    "events": [
      {
        "event": "order_created",
        "session_id": "system-session",
        "page": {
          "path": "/orders",
          "title": "Orders",
          "referrer": "https://example.com"
        },
        "properties": {"orderId": "ord_123"}
      }
    ]
  }'
```

Note: use `session_id` (snake_case) in ingestion payloads.

## Validation Checklist

- Script URL points to your API server
- data-api-key is present and valid
- X-Project-Key reaches API requests
- /events/config responds 200 for your project
- /events/batch responds 200 and events appear in dashboard

## Runtime Control Quick Usage

Public runtime fetch:

```bash
curl -H "Authorization: Bearer PROJECT_API_KEY" \
  "https://your-trackion-server.com/v1/runtime?user_id=user-123"
```

`user_id` is optional and used for rollout evaluation when provided.

Dashboard management flow:

1. Open Project Detail.
2. Add or update Feature Flags with enabled state + rollout percentage.
3. Add or update Remote Config using JSON values.
4. Clients fetch runtime and read flags/config immediately.

## SDK Examples

Repository examples for each integration style:

- Web module: `examples/web/index.ts`
- React: `examples/react/App.tsx`
- Vue 3: `examples/vue/main.ts`
- Node: `examples/node/index.ts`
- Script tag: `examples/script/index.html`

NPM package variants:

- `@trackion/js`
- `@trackion/js/react`
- `@trackion/js/vue`
- `@trackion/js/node`
