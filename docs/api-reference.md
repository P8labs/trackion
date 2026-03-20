# API Reference

Base URL examples:

- Local: http://localhost:8000
- Production: https://your-domain

All successful responses follow:

```json
{
  "status": true,
  "message": "...",
  "data": {}
}
```

## Authentication

Two token types are used:

1. Project key for ingestion APIs via X-Project-Key
2. Bearer token for dashboard APIs via Authorization: Bearer &lt;token&gt;

In self-host mode, the bearer token is TRACKION_ADMIN_TOKEN.

## Health

### GET /health

Checks API and DB connectivity.

## Auth

### POST /api/auth/verify

Verifies login token and returns user payload.

Request:

```json
{
  "token": "your-token"
}
```

Optional header:

- Authorization: Bearer your-token

### SaaS-only OAuth Endpoints

- GET /auth/login/github?client=web
- GET /auth/callback/github
- GET /auth/me
- POST /auth/logout

## Event Ingestion

All require X-Project-Key.

### POST /events/collect

Single event ingestion.

### POST /events/batch

Batch event ingestion.

### GET /events/config

Returns tracker configuration for the project identified by X-Project-Key.

Example single event body:

```json
{
  "eventName": "button_click",
  "sessionId": "session-1",
  "pagePath": "/pricing",
  "pageTitle": "Pricing",
  "referrer": "https://google.com",
  "properties": {
    "cta": "start_trial"
  }
}
```

## Projects API

All routes are protected by bearer auth.

- GET /api/projects/
- POST /api/projects/
- GET /api/projects/{id}
- PUT /api/projects/{id}
- DELETE /api/projects/{id}

## Analytics API

All routes are protected by bearer auth.

- GET /api/analytics/{id}/counts
- GET /api/analytics/{id}/chart-data?time_range=24h&event_filter=
- GET /api/analytics/{id}/area-chart-data?time_range=7d&event_filter=
- GET /api/analytics/{id}/device-analytics
- GET /api/analytics/{id}/traffic-sources
- GET /api/analytics/{id}/top-pages
- GET /api/analytics/{id}/recent-events?limit=50

## Settings API

Protected by bearer auth.

- GET /api/settings/usage

## Tracker Assets

- GET /t.js
- GET /t.min.js

## Example: Verify Token + List Projects

```bash
TOKEN="your-admin-or-session-token"

curl -X POST http://localhost:8000/api/auth/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"token\": \"$TOKEN\"}"

curl http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer $TOKEN"
```
