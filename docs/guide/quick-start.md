# Quick Start

Get Trackion running and start tracking analytics in under 2 minutes.

## Step 1: Install Trackion

### Using Docker (Recommended)

```bash
git clone https://github.com/p8labs/trackion
cd trackion
docker-compose up -d
```

This starts:

- **Backend server** on `localhost:8000`
- **Dashboard** on `localhost:3000`
- **PostgreSQL database** on `localhost:5432`

### Manual Installation

If you prefer to run without Docker:

```bash
# Backend
go mod download
go run cmd/api.go

# Dashboard (in another terminal)
cd dashboard
npm install
npm run dev
```

## Step 2: Create a Project

1. Open the dashboard at `http://localhost:3000`
2. Complete the initial setup (admin token or GitHub OAuth)
3. Create your first project
4. Copy the **Project Key** - you'll need this for tracking

## Step 3: Add Tracking Script

Add the Trackion script to your website or application:

```html
<script
  src="http://localhost:8000/t.js"
  data-project="your-project-key"
></script>
```

That's it! Your site will now automatically track:

- **Page views** with URLs and titles
- **User sessions** and engagement metrics  
- **Referrer information** and traffic sources
- **Basic device/browser data**

## Step 4: Send Custom Events

Track specific actions using the REST API:

### JavaScript

```javascript
fetch('http://localhost:8000/events/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Project-Key': 'your-project-key'
  },
  body: JSON.stringify([{
    event: 'button_click',
    sessionId: 'unique-session-id',
    timestamp: new Date().toISOString(),
    page: {
      url: window.location.href,
      title: document.title
    },
    properties: {
      button_text: 'Sign Up',
      user_id: '12345'
    }
  }])
});
```

### Python

```python
import requests
from datetime import datetime

def track_event(event_name, properties={}):
    payload = [{
        "event": event_name,
        "sessionId": "user-session-id", 
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "page": {
            "url": "https://example.com/page",
            "title": "Page Title"
        },
        "properties": properties
    }]
    
    response = requests.post(
        'http://localhost:8000/events/batch',
        headers={
            'Content-Type': 'application/json',
            'X-Project-Key': 'your-project-key'
        },
        json=payload
    )
    return response

# Usage
track_event('user_signup', {'plan': 'premium'})
```

## Step 5: View Your Analytics

Open your dashboard to see:

- **Real-time page views** and user sessions
- **Top pages** and referrer sources  
- **Custom events** you've tracked
- **User engagement** metrics

## What's Next?

- [Self-hosting Guide](/guide/self-hosting) - Deploy to production
- [API Reference](/api/) - Complete API documentation  

::: tip Need Help?
Having issues? Check [GitHub Issues](https://github.com/p8labs/trackion/issues) or email [hello@p8labs.dev](mailto:hello@p8labs.dev).
:::
