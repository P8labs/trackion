# Error Tracking API

This document describes the Error Tracking API endpoints for querying and managing captured errors.

## Base URL

All API requests should be made to:

```
https://api.trackion.tech/api/errors
```

For self-hosted instances, replace the domain with your Trackion server URL.

## Authentication

All error tracking endpoints require authentication via the `Authorization` header:

```http
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### List Grouped Errors

List all errors grouped by fingerprint for a project.

```http
GET /api/errors?project_id={project_id}&limit={limit}&offset={offset}&since={timestamp}
```

**Query Parameters:**

- `project_id` (required): Project UUID
- `limit` (optional): Number of results to return (default: 50, max: 100)
- `offset` (optional): Number of results to skip (default: 0)
- `since` (optional): ISO timestamp to filter errors after this date

**Example Request:**

```bash
curl -X GET \
  'https://api.trackion.tech/api/errors?project_id=550e8400-e29b-41d4-a716-446655440000&limit=20' \
  -H 'Authorization: Bearer your-api-key'
```

**Example Response:**

```json
{
  "errors": [
    {
      "fingerprint": "a1b2c3d4e5f6...",
      "message": "Cannot read property 'user' of undefined",
      "count": 42,
      "first_seen": "2024-01-15T10:30:00Z",
      "last_seen": "2024-01-15T15:45:00Z"
    },
    {
      "fingerprint": "f6e5d4c3b2a1...",
      "message": "Failed to fetch user data",
      "count": 8,
      "first_seen": "2024-01-15T09:15:00Z",
      "last_seen": "2024-01-15T14:20:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 2
  }
}
```

### Get Error Occurrences

Get individual occurrences for a specific error fingerprint.

```http
GET /api/errors/{fingerprint}?project_id={project_id}&limit={limit}&offset={offset}
```

**Path Parameters:**

- `fingerprint` (required): Error fingerprint (SHA256 hash)

**Query Parameters:**

- `project_id` (required): Project UUID
- `limit` (optional): Number of occurrences to return (default: 20, max: 100)
- `offset` (optional): Number of occurrences to skip (default: 0)

**Example Request:**

```bash
curl -X GET \
  'https://api.trackion.tech/api/errors/a1b2c3d4e5f6.../550e8400-e29b-41d4-a716-446655440000' \
  -H 'Authorization: Bearer your-api-key'
```

**Example Response:**

```json
{
  "fingerprint": "a1b2c3d4e5f6...",
  "occurrences": [
    {
      "id": "evt_1234567890",
      "timestamp": "2024-01-15T15:45:00Z",
      "message": "Cannot read property 'user' of undefined",
      "stack_trace": "TypeError: Cannot read property 'user' of undefined\n    at UserProfile.render (app.js:245:12)\n    at Component.render (react.js:1832:10)",
      "url": "https://app.example.com/profile",
      "line_number": 245,
      "column_number": 12,
      "user_id": "user_12345",
      "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "context": {
        "component": "UserProfile",
        "route": "/profile"
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 42
  }
}
```

## Error Ingestion

Errors are ingested through the standard events API with `event_type: "error"`.

**Error Event Structure:**

```json
{
  "event_name": "error",
  "event_type": "error",
  "properties": {
    "error_message": "Cannot read property 'user' of undefined",
    "stack_trace": "TypeError: Cannot read property...",
    "fingerprint": "a1b2c3d4e5f6...",
    "url": "https://app.example.com/profile",
    "line_number": 245,
    "column_number": 12,
    "user_agent": "Mozilla/5.0...",
    "context": {
      "component": "UserProfile"
    }
  }
}
```

## Error Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid parameters or missing required fields
- `401 Unauthorized`: Invalid or missing API key
- `404 Not Found`: Error fingerprint not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

Error tracking endpoints are subject to the same rate limits as other API endpoints:

- 1000 requests per minute per API key
- Burst allowance of 100 requests

## Best Practices

1. **Pagination**: Always use pagination for large result sets
2. **Filtering**: Use the `since` parameter to fetch only recent errors
3. **Caching**: Cache error lists on the client side for better performance
4. **Fingerprints**: Store fingerprints to avoid duplicate API calls
5. **Context**: Include relevant context when capturing errors via SDK

## SDKs

Use the official Trackion SDKs for automatic error capture:

- **Web/React**: `@trackion/js`
- **Node.js**: `@trackion/js/node`
