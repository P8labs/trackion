# JavaScript API

This page focuses on browser-side Trackion usage, including script integration, runtime behavior, and practical debugging.

For framework-specific examples, see [SDK Usage](/sdk-usage).

## Integration Options

### Option A: npm SDK

```bash
npm install @trackion/js
```

```ts
import { createTrackionClient } from "@trackion/js";

const trackion = createTrackionClient({
  serverUrl: "https://api.example.com",
  apiKey: "PROJECT_API_KEY",
  userId: "user-123",
});

trackion.track("signup.started", { source: "landing" });
await trackion.refreshRuntime();
```

### Option B: Script Tag

```html
<script
  src="https://api.example.com/t.js"
  data-api-key="PROJECT_API_KEY"
></script>
```

Script variants:

- `/t.js`
- `/t.min.js`

## Tracker Behavior

When initialized with a valid API key, the tracker typically:

1. Fetches project config from `GET /events/config`
2. Queues automatic and manual events
3. Flushes events to `POST /events/batch`
4. Attaches project auth via `X-Project-Key`

## Global API (`trackion`)

Manual event:

```js
trackion.track("signup_started", {
  source: "landing",
  plan: "pro",
});
```

## Runtime Controls in Browser

Use public runtime endpoint to evaluate flags/config client-side:

```bash
curl -H "X-Project-Key: PROJECT_API_KEY" \
  "https://api.example.com/v1/runtime?user_id=user-123"
```

Key rollout semantics:

- `enabled=false` => always off
- `rollout_percentage=100` => always on
- partial rollout requires stable `user_id`

## Event Payload Shape (HTTP)

If sending custom requests directly:

```json
{
  "project_key": "PROJECT_API_KEY",
  "event": "checkout.submit",
  "session_id": "session-123",
  "page": {
    "path": "/checkout",
    "title": "Checkout",
    "referrer": "https://example.com/pricing"
  },
  "utm": {
    "source": "newsletter",
    "medium": "email",
    "campaign": "spring"
  },
  "properties": {
    "value": 4999,
    "currency": "USD"
  }
}
```

Important: ingestion contract expects `session_id` in snake_case.

## Error Capture Strategy

For browser apps, error events can be sent through normal event ingestion by setting event type/category metadata in properties. The server-side error APIs group and query these events by fingerprint.

See [Error Tracking API](/api/errors).

## Validation Checklist

1. Script URL points to correct API origin
2. `data-api-key` is valid for existing project
3. `/events/config` returns `200` and optional `ETag`
4. `/events/batch` returns `200`
5. Events appear in dashboard recent events
6. Runtime endpoint returns expected flag/config values

## Debugging Tips

### Nothing is sent

- Check CSP/script blocking
- Verify script loaded successfully
- Verify project key and domain restrictions

### Events sent but no dashboard data

- Confirm project selected in dashboard matches key
- Check payload fields (`event`, `session_id`)
- Inspect API responses for validation errors

### Runtime values not changing

- Re-fetch runtime after updating dashboard values
- Use stable `user_id` for rollout tests
- Ensure flag key names match exactly
