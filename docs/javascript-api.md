# JavaScript API

Trackion ships a client tracker script from your own server.

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
        "session_Id": "system-session",
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

Note: use `session_Id` (capital `I`) in ingestion payloads.

## Validation Checklist

- Script URL points to your API server
- data-api-key is present and valid
- X-Project-Key reaches API requests
- /events/config responds 200 for your project
- /events/batch responds 200 and events appear in dashboard
