# Custom Events

Learn how to track specific actions and workflows in your application using Trackion's event tracking system.

## Overview

While page views are tracked automatically, custom events let you monitor specific actions that matter to your business:

- User signups and logins
- Button clicks and interactions
- Form submissions
- Purchase completions
- Feature usage
- Error occurrences
- Performance milestones

## Sending Events via REST API

### Basic Event Structure

```json
{
  "project": "your-project-key",
  "name": "event.name",
  "properties": {
    "key": "value",
    "user_id": "optional",
    "session_id": "optional"
  }
}
```

### Example: User Signup

```bash
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "project": "your-project-key",
    "name": "user.signup",
    "properties": {
      "user_id": "12345",
      "email": "user@example.com",
      "plan": "premium",
      "referrer": "google"
    }
  }'
```

### Example: Feature Usage

```bash
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "project": "your-project-key",
    "name": "feature.used",
    "properties": {
      "feature": "dark_mode",
      "user_id": "12345",
      "enabled": true
    }
  }'
```

## Implementation in Different Languages

### JavaScript/Node.js

```javascript
async function trackEvent(name, properties = {}) {
  try {
    const response = await fetch("http://localhost:8080/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project: "your-project-key",
        name,
        properties,
      }),
    });

    if (!response.ok) {
      console.error("Failed to track event:", response.statusText);
    }
  } catch (error) {
    console.error("Error tracking event:", error);
  }
}

// Usage examples
trackEvent("user.login", { user_id: "123", method: "google" });
trackEvent("button.click", { button_id: "cta-signup", page: "home" });
trackEvent("form.submit", { form_type: "contact", success: true });
```

### Python

```python
import requests
import json

def track_event(name, properties=None):
    """Send custom event to Trackion"""
    if properties is None:
        properties = {}

    payload = {
        'project': 'your-project-key',
        'name': name,
        'properties': properties
    }

    try:
        response = requests.post(
            'http://localhost:8080/events',
            headers={'Content-Type': 'application/json'},
            data=json.dumps(payload)
        )
        response.raise_for_status()
        print(f"Event '{name}' tracked successfully")
    except requests.exceptions.RequestException as e:
        print(f"Failed to track event: {e}")

# Usage examples
track_event('user.signup', {
    'user_id': '123',
    'plan': 'premium',
    'source': 'website'
})

track_event('api.call', {
    'endpoint': '/users',
    'method': 'POST',
    'status_code': 201,
    'response_time': 245
})
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type Event struct {
    Project    string                 `json:"project"`
    Name       string                 `json:"name"`
    Properties map[string]interface{} `json:"properties"`
}

func trackEvent(name string, properties map[string]interface{}) error {
    event := Event{
        Project:    "your-project-key",
        Name:       name,
        Properties: properties,
    }

    jsonData, err := json.Marshal(event)
    if err != nil {
        return err
    }

    resp, err := http.Post(
        "http://localhost:8080/events",
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("failed to track event: %s", resp.Status)
    }

    return nil
}

// Usage examples
func main() {
    // Track user signup
    trackEvent("user.signup", map[string]interface{}{
        "user_id": "123",
        "plan": "premium",
    })

    // Track API usage
    trackEvent("api.request", map[string]interface{}{
        "endpoint": "/api/users",
        "method": "GET",
        "status": 200,
    })
}
```

### PHP

```php
<?php
function trackEvent($name, $properties = []) {
    $data = [
        'project' => 'your-project-key',
        'name' => $name,
        'properties' => $properties
    ];

    $options = [
        'http' => [
            'header' => "Content-Type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];

    $context = stream_context_create($options);
    $result = file_get_contents('http://localhost:8080/events', false, $context);

    if ($result === FALSE) {
        error_log("Failed to track event: $name");
    }
}

// Usage examples
trackEvent('user.login', [
    'user_id' => '123',
    'method' => 'email'
]);

trackEvent('purchase.completed', [
    'order_id' => 'ORD-123',
    'amount' => 99.99,
    'currency' => 'USD'
]);
?>
```

## Event Naming Conventions

Use a consistent naming convention for your events:

```
category.action
```

**Examples:**

- `user.signup` - User created account
- `user.login` - User logged in
- `user.logout` - User logged out
- `button.click` - Button was clicked
- `form.submit` - Form was submitted
- `page.view` - Page was viewed (automatic)
- `feature.used` - Feature was used
- `error.occurred` - Error happened

## Best Practices

### 1. Keep Properties Consistent

Use the same property names across similar events:

```javascript
// Good ✅
trackEvent("button.click", { button_id: "signup", page: "home" });
trackEvent("button.click", { button_id: "login", page: "auth" });

// Avoid ❌
trackEvent("button.click", { id: "signup", location: "home" });
trackEvent("button.click", { button_name: "login", page_name: "auth" });
```

### 2. Include Context

Add relevant context to help with analysis:

```javascript
trackEvent("purchase.completed", {
  order_id: "ORD-123",
  amount: 99.99,
  currency: "USD",
  user_id: "456",
  payment_method: "stripe",
  source: "mobile_app",
});
```

### 3. Handle Errors Gracefully

Don't let tracking failures break your application:

```javascript
function safeTrackEvent(name, properties) {
  try {
    trackEvent(name, properties);
  } catch (error) {
    console.warn("Analytics tracking failed:", error);
    // Continue with application logic
  }
}
```

### 4. Use Environment Variables

Don't hardcode your project key:

```javascript
const TRACKION_PROJECT = process.env.TRACKION_PROJECT_KEY || "default-key";

function trackEvent(name, properties) {
  return fetch(`${process.env.TRACKION_URL}/events`, {
    // ... rest of implementation
  });
}
```

## Event Properties

Properties can include any data relevant to the event:

| Property Type | Example                    | Description              |
| ------------- | -------------------------- | ------------------------ |
| User ID       | `"user_id": "123"`         | Identify the user        |
| Session ID    | `"session_id": "sess_abc"` | Group events by session  |
| Page/Location | `"page": "checkout"`       | Where the event occurred |
| Feature       | `"feature": "dark_mode"`   | Which feature was used   |
| Amount        | `"amount": 99.99`          | Monetary values          |
| Status        | `"success": true`          | Operation outcome        |
| Metadata      | `"plan": "premium"`        | Additional context       |

## Viewing Custom Events

Once you're sending custom events, you can view them in the Trackion dashboard:

1. **Events List** - See all recent events in real-time
2. **Event Breakdown** - Analyze which events are most common
3. **Event Properties** - Drill down into event details
4. **Time-based Analysis** - Track events over time

## Next Steps

- [API Reference](/api/events) - Complete events API documentation
- [Analytics Dashboard](/guide/analytics) - Understanding your data
- [Projects](/guide/projects) - Organizing your tracking
