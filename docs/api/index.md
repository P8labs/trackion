# API Reference

Complete API documentation for integrating with Trackion programmatically.

## Base URL

```
http://localhost:8080  # Development
https://your-domain.com  # Production
```

## Authentication

Trackion uses different authentication methods for different endpoints:

- **Admin Token** - For dashboard API access (projects, analytics)
- **Project Key** - For sending events
- **No Auth** - For public tracking scripts

### Admin Token Authentication

For dashboard APIs, include your admin token:

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:8080/api/projects
```

### Project Key Authentication

For sending events, include the project key in the request body:

```bash
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "project": "your-project-key",
    "name": "event.name"
  }'
```

## Rate Limiting

- **Events API**: 1000 requests per minute per project
- **Dashboard API**: 100 requests per minute per token
- **Tracking Script**: No rate limit

## Response Format

All API responses use JSON format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Events API

### Send Event

Track custom events in your application.

**Endpoint:** `POST /events`

**Authentication:** Project key in request body

**Request Body:**

```json
{
  "project": "string (required)",
  "name": "string (required)",
  "properties": {
    "key": "value",
    "user_id": "string (optional)",
    "session_id": "string (optional)"
  }
}
```

**Example:**

```bash
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "project": "proj_abc123",
    "name": "user.signup",
    "properties": {
      "user_id": "12345",
      "plan": "premium",
      "source": "website"
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Event tracked successfully"
}
```

## Projects API

Manage projects programmatically.

### List Projects

**Endpoint:** `GET /api/projects`

**Authentication:** Admin token required

**Example:**

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:8080/api/projects
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "proj_abc123",
      "name": "My Website",
      "description": "Main website analytics",
      "created_at": "2026-03-18T10:00:00Z",
      "updated_at": "2026-03-18T10:00:00Z"
    }
  ]
}
```

### Get Project

**Endpoint:** `GET /api/projects/{project_id}`

**Authentication:** Admin token required

**Example:**

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:8080/api/projects/proj_abc123
```

### Create Project

**Endpoint:** `POST /api/projects`

**Authentication:** Admin token required

**Request Body:**

```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

**Example:**

```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "description": "Analytics for new app"
  }'
```

### Update Project

**Endpoint:** `PUT /api/projects/{project_id}`

**Authentication:** Admin token required

**Request Body:**

```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

### Delete Project

**Endpoint:** `DELETE /api/projects/{project_id}`

**Authentication:** Admin token required

**Example:**

```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:8080/api/projects/proj_abc123
```

## Analytics API

Retrieve analytics data for your projects.

### Get Dashboard Data

**Endpoint:** `GET /api/analytics/{project_id}/dashboard`

**Authentication:** Admin token required

**Query Parameters:**

- `start_date` - ISO date string (optional, defaults to 30 days ago)
- `end_date` - ISO date string (optional, defaults to now)

**Example:**

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:8080/api/analytics/proj_abc123/dashboard?start_date=2026-03-01"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total_events": 2847,
    "page_views": 1439,
    "unique_visitors": 567,
    "avg_session_duration": "2m 14s",
    "custom_events": 156,
    "bounce_rate": 0.45,
    "top_pages": [
      {
        "path": "/",
        "views": 432,
        "unique_visitors": 201
      }
    ],
    "events_over_time": [
      {
        "date": "2026-03-18",
        "events": 125,
        "page_views": 89
      }
    ]
  }
}
```

### Get Recent Events

**Endpoint:** `GET /api/analytics/{project_id}/events`

**Authentication:** Admin token required

**Query Parameters:**

- `limit` - Number of events (default: 50, max: 1000)
- `offset` - Pagination offset (default: 0)
- `event_name` - Filter by event name (optional)

**Example:**

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:8080/api/analytics/proj_abc123/events?limit=10"
```

## Tracking Script

Client-side JavaScript tracking for automatic page view collection.

### Basic Implementation

**Endpoint:** `GET /t.js`

**Authentication:** None (public)

**Usage:**

```html
<script
  src="http://localhost:8080/t.js"
  data-project="your-project-key"
></script>
```

### Minified Version

**Endpoint:** `GET /t.min.js`

For production use with smaller file size.

### Script Configuration

Configure the tracking script with data attributes:

```html
<script
  src="http://localhost:8080/t.js"
  data-project="your-project-key"
  data-auto-pageviews="true"
  data-track-outbound="true"
></script>
```

**Available Options:**

- `data-project` - Your project key (required)
- `data-auto-pageviews` - Automatically track page views (default: true)
- `data-track-outbound` - Track outbound link clicks (default: false)

## Error Codes

Common error codes and their meanings:

| Code                     | Description                             |
| ------------------------ | --------------------------------------- |
| `INVALID_PROJECT`        | Project key not found or invalid        |
| `MISSING_REQUIRED_FIELD` | Required field missing from request     |
| `UNAUTHORIZED`           | Invalid or missing authentication token |
| `RATE_LIMIT_EXCEEDED`    | Too many requests in time window        |
| `INVALID_JSON`           | Request body is not valid JSON          |
| `PROJECT_NOT_FOUND`      | Requested project does not exist        |
| `INTERNAL_ERROR`         | Server-side error occurred              |

## SDKs and Libraries

### Official SDKs

Currently, Trackion provides REST API access. Official SDKs for popular languages are planned:

- JavaScript/Node.js SDK (planned)
- Python SDK (planned)
- Go SDK (planned)
- PHP SDK (planned)

### Community Libraries

Trackion's simple REST API makes it easy to integrate with any language. Community contributions welcome!

## Webhook Support

::: tip Coming Soon
Webhook support for real-time event notifications is planned for a future release.
:::

## API Versioning

Current API version: **v1**

The API is currently unversioned but follows semantic versioning principles. Breaking changes will introduce new API versions.

## Examples

### Complete Integration Example

```javascript
class TrackionClient {
  constructor(serverUrl, projectKey) {
    this.serverUrl = serverUrl;
    this.projectKey = projectKey;
  }

  async trackEvent(name, properties = {}) {
    try {
      const response = await fetch(`${this.serverUrl}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project: this.projectKey,
          name,
          properties,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to track event:", error);
      throw error;
    }
  }

  // Convenience methods
  trackPageView(path, title) {
    return this.trackEvent("page.view", { path, title });
  }

  trackUserAction(action, userId, metadata = {}) {
    return this.trackEvent(`user.${action}`, {
      user_id: userId,
      ...metadata,
    });
  }
}

// Usage
const trackion = new TrackionClient(
  "http://localhost:8080",
  "your-project-key",
);

trackion.trackUserAction("signup", "12345", {
  plan: "premium",
  source: "website",
});
```

## Support

- [GitHub Issues](https://github.com/p8labs/trackion/issues) - Bug reports and feature requests
- [Discussions](https://github.com/p8labs/trackion/discussions) - Community support
- [Documentation](/guide/) - Complete guides and tutorials
