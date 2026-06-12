# Error Tracking API

Trackion stores error events in the main events table and exposes grouped error query APIs under `/api/errors`.

## Authentication

All `/api/errors/*` endpoints require dashboard bearer auth:

```http
Authorization: Bearer TOKEN
```

- Selfhost: `TOKEN` is `TRACKION_ADMIN_TOKEN`
- SaaS: session token from OAuth flow

## Endpoint Summary

### List Grouped Errors

```http
GET /api/errors?project_id={project_id}&time_range={24h|7d|30d|all}&limit={n}&offset={n}
```

Query params:

- `project_id` (required)
- `time_range` (optional, default `7d`)
- `limit` (optional)
- `offset` (optional)

Returns grouped errors by fingerprint with count, first seen, and last seen.

### Get Error Occurrences

```http
GET /api/errors/{fingerprint}?project_id={project_id}&limit={n}&offset={n}
```

Params:

- `fingerprint` (path, required)
- `project_id` (query, required)
- `limit`, `offset` (optional)

Returns individual error occurrences for a fingerprint.

### Get Error Stats

```http
GET /api/errors/stats?project_id={project_id}&time_range={24h|7d|30d|all}
```

Returns total error count for selected window.

## Example: List Errors

```bash
curl "http://localhost:8000/api/errors?project_id=PROJECT_ID&time_range=7d&limit=20" \
  -H "Authorization: Bearer TRACKION_ADMIN_TOKEN"
```

Example response envelope:

```json
{
  "status": true,
  "message": "Errors fetched successfully.",
  "data": [
    {
      "fingerprint": "4f9e...",
      "message": "Cannot read properties of undefined",
      "count": 42,
      "first_seen": "2026-04-01T10:30:00Z",
      "last_seen": "2026-04-05T15:45:00Z",
      "last_url": "https://app.example.com/settings"
    }
  ]
}
```

## How Errors Are Grouped

Fingerprint generation uses deterministic hashing from:

1. normalized error message
2. first relevant stack trace line

This keeps repeated instances grouped together while preserving per-occurrence detail.

## Error Ingestion Model

Errors are ingested through normal event routes (`/events/collect` or `/events/batch`) and recognized by `event_type`/properties.

Typical payload fields:

```json
{
  "event": "error",
  "type": "error",
  "session_id": "session-1",
  "properties": {
    "error_message": "Cannot read properties of undefined",
    "stack_trace": "TypeError: ...",
    "fingerprint": "4f9e...",
    "url": "https://app.example.com/settings",
    "line_number": 24,
    "column_number": 12,
    "context": {
      "route": "/settings"
    }
  }
}
```

## Status Codes

- `200`: success
- `400`: missing/invalid params (for example missing `project_id`)
- `401`: unauthorized
- `500`: backend query failure

## Operational Notes

- Use time windows (`time_range`) for dashboard performance
- Indexes include event error query paths and fingerprint JSON keys
- Keep stack traces and context concise to control storage growth

## Related Pages

- Main endpoint reference: [API Reference](/api-reference)
- Schema/index detail: [Database Schema](/database-schema)
