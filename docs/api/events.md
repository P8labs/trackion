# Events API

Detailed API reference for sending and managing events.

## Send Event

Send custom events to track user actions and application events.

**Endpoint:** `POST /events`

**Authentication:** Project key in request body

### Request Format

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

### Response

```json
{
  "success": true,
  "message": "Event tracked successfully"
}
```

### Examples

**User Signup:**

```bash
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "project": "proj_abc123",
    "name": "user.signup",
    "properties": {
      "user_id": "12345",
      "plan": "premium"
    }
  }'
```

**Button Click:**

```bash
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "project": "proj_abc123",
    "name": "button.click",
    "properties": {
      "button_id": "cta-signup",
      "page": "landing"
    }
  }'
```

For more details, see the [main API reference](/api/).
