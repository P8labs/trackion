# API Reference

This reference documents Trackion HTTP endpoints exposed by the Go API server.

## Base URL

- Local: `http://localhost:8000`
- Production: `https://api.your-domain.com`

## Response Envelope

Most endpoints return:

```json
{
  "status": true,
  "message": "...",
  "data": {}
}
```

Error responses use:

```json
{
  "status": false,
  "message": "error message"
}
```

## Authentication

### Project Key (Ingestion + Public Runtime)

Use project API key in header:

```http
X-Project-Key: PROJECT_API_KEY
```

Used by `/events/*` and `/replay` ingestion routes.

### Bearer Token (Dashboard APIs)

```http
Authorization: Bearer TOKEN
```

- Selfhost: `TOKEN == TRACKION_ADMIN_TOKEN`
- SaaS: session token from OAuth flow

## Public Routes

### `GET /health`

Health/readiness payload with server version and timestamp.

### `GET /t.js` and `GET /t.min.js`

Served tracker assets for browser integration.

### `POST /api/auth/verify`

Verifies bearer/body token and returns auth payload.

Request:

```json
{ "token": "your-token" }
```

Rules:

- Token can come from body, bearer header, or both
- If both body + bearer are provided and mismatch, request is rejected

### SaaS OAuth Routes

- `GET /auth/login/github?client=web|desktop`
- `GET /auth/login/google?client=web|desktop`
- `GET /auth/callback/github`
- `GET /auth/callback/google`
- `GET /auth/me` (auth required)
- `POST /auth/logout` (auth required)

## Event Ingestion Routes (`/events`)

### `POST /events/collect`

Ingest one event.

Required fields:

- `event`
- `session_id`

Example:

```json
{
  "project_key": "PROJECT_API_KEY",
  "event": "button_click",
  "type": "custom",
  "session_id": "session-1",
  "user_id": "user-123",
  "page": {
    "path": "/pricing",
    "title": "Pricing",
    "referrer": "https://google.com"
  },
  "utm": {
    "source": "newsletter",
    "medium": "email",
    "campaign": "spring-launch"
  },
  "properties": {
    "cta": "start_trial"
  }
}
```

### `POST /events/batch`

Ingest multiple events in one request.

```json
{
  "project_key": "PROJECT_API_KEY",
  "events": [
    {
      "event": "page_view",
      "session_id": "session-1",
      "page": { "path": "/", "title": "Home" }
    }
  ]
}
```

### `GET /events/config`

Returns tracker behavior config for project identified by `X-Project-Key`.

Supports `ETag` and `If-None-Match` caching behavior.

## Replay Routes

### `POST /replay/`

Ingest replay payload asynchronously.

Request constraints:

- `Content-Type: application/json`
- body max size ~1MB
- requires `project_key`, `session_id`, and non-empty `events`

### Protected Replay Routes (`/api/replay`)

- `GET /api/replay/projects/{id}/sessions?limit=50`
- `GET /api/replay/projects/{id}/sessions/{sessionId}`
- `DELETE /api/replay/projects/{id}/sessions/{sessionId}`

## Runtime Routes

### Public Runtime Fetch

`GET /v1/runtime?user_id=<optional>`

Returns evaluated feature flags/config for project from `X-Project-Key`.

Rollout behavior:

- disabled flag => `false`
- rollout `100` => `true`
- rollout `1..99` => deterministic by `user_id`
- no `user_id` during partial rollout => `false`

### Protected Runtime Management

- `GET /api/runtime/projects/{id}/runtime`
- `PUT /api/runtime/projects/{id}/runtime/flags/{key}`
- `DELETE /api/runtime/projects/{id}/runtime/flags/{key}`
- `PUT /api/runtime/projects/{id}/runtime/config/{key}`
- `DELETE /api/runtime/projects/{id}/runtime/config/{key}`

Flag body:

```json
{
  "enabled": true,
  "rollout_percentage": 50
}
```

Config body:

```json
{
  "value": {
    "title": "Upgrade",
    "cta": "Start trial"
  }
}
```

## Protected Project Routes

- `GET /api/projects/`
- `POST /api/projects/`
- `GET /api/projects/{id}`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`

## Protected Analytics Routes

- `GET /api/analytics/{id}/counts`
- `GET /api/analytics/{id}/chart-data`
- `GET /api/analytics/{id}/area-chart-data`
- `GET /api/analytics/{id}/device-analytics`
- `GET /api/analytics/{id}/traffic-sources`
- `GET /api/analytics/{id}/top-pages`
- `GET /api/analytics/{id}/recent-events`
- `GET /api/analytics/{id}/recent-events-paginated`
- `GET /api/analytics/{id}/online-users`
- `GET /api/analytics/{id}/country-data`
- `GET /api/analytics/{id}/country-map-data`
- `GET /api/analytics/{id}/traffic-heatmap`

## Protected Error Routes

- `GET /api/errors?project_id=...&time_range=7d&limit=50&offset=0`
- `GET /api/errors/{fingerprint}?project_id=...&limit=20&offset=0`
- `GET /api/errors/stats?project_id=...&time_range=7d`

See dedicated [Error Tracking API](/api/errors) page for full details.

## Protected Settings + Billing Routes

- `GET /api/settings/usage`
- `GET /api/billing/usage`
- `GET /api/billing/plan`

## Example Flow: Verify + List Projects

```bash
TOKEN="your-admin-or-session-token"

curl -X POST http://localhost:8000/api/auth/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"token\": \"$TOKEN\"}"

curl http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer $TOKEN"
```

## Related Pages

- SDK integration examples: [SDK Usage](/sdk-usage)
- Browser runtime behavior: [JavaScript API](/javascript-api)
- System design and modules: [Architecture](/architecture)
