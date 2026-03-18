# Projects API

API endpoints for managing projects programmatically.

## List Projects

**Endpoint:** `GET /api/projects`
**Authentication:** Admin token required

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "proj_abc123",
      "name": "My Website",
      "description": "Main website analytics",
      "created_at": "2026-03-18T10:00:00Z"
    }
  ]
}
```

## Create Project

**Endpoint:** `POST /api/projects`
**Authentication:** Admin token required

### Request

```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

### Example

```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "description": "Analytics for new app"
  }'
```

For complete API documentation, see the [API Reference](/api/).
