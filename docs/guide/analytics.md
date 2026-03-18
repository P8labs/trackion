# Analytics Tracking

Learn how to implement automatic analytics tracking with the Trackion JavaScript library.

## Overview

Trackion automatically tracks:

- **Page Views** - Navigation and page visits
- **User Sessions** - Engagement and time spent
- **Performance Metrics** - Page load times
- **Referrer Information** - Traffic sources

## Basic Implementation

### 1. Add the Tracking Script

Include the Trackion tracking script on every page you want to monitor:

```html
<script
  src="http://localhost:8080/t.js"
  data-project="your-project-key"
></script>
```

::: tip Production URL
Replace `localhost:8080` with your production Trackion server URL:

```html
<script
  src="https://analytics.yoursite.com/t.js"
  data-project="your-project-key"
></script>
```

:::

### 2. That's It!

Once the script is loaded, Trackion automatically begins tracking:

- Page views when pages load
- Session duration and engagement
- User navigation patterns
- Basic performance metrics

## Configuration Options

Customize tracking behavior with data attributes:

```html
<script
  src="http://localhost:8080/t.js"
  data-project="your-project-key"
  data-auto-pageviews="true"
  data-track-outbound="false"
  data-honor-dnt="true"
></script>
```

### Available Options

| Attribute             | Default  | Description                    |
| --------------------- | -------- | ------------------------------ |
| `data-project`        | Required | Your project key               |
| `data-auto-pageviews` | `true`   | Automatically track page views |
| `data-track-outbound` | `false`  | Track external link clicks     |
| `data-honor-dnt`      | `true`   | Respect Do Not Track headers   |

## What Gets Tracked

### Page Views

Each page load automatically sends:

```json
{
  "name": "page.view",
  "properties": {
    "path": "/about",
    "title": "About Us",
    "referrer": "https://google.com",
    "user_agent": "Mozilla/5.0...",
    "screen_resolution": "1920x1080",
    "viewport": "1200x800"
  }
}
```

### Session Data

User sessions track:

- Session start and duration
- Pages viewed per session
- Bounce rate (single page visits)
- Time spent on each page

### Performance Metrics

Basic performance tracking:

- Page load time
- DOM ready time
- First paint time

## Single Page Applications (SPAs)

For React, Vue, Angular, and other SPAs, you need to manually trigger page views on route changes:

### React Example

```javascript
// App.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    if (window.trackion) {
      window.trackion.pageView(location.pathname, document.title);
    }
  }, [location]);

  return (
    // Your app content
  );
}
```

### Vue.js Example

```javascript
// router/index.js
import { createRouter } from "vue-router";

const router = createRouter({
  // ... your routes
});

router.afterEach((to) => {
  if (window.trackion) {
    window.trackion.pageView(to.path, to.meta.title || document.title);
  }
});
```

### Manual Page View Tracking

```javascript
// Track page view manually
if (window.trackion) {
  window.trackion.pageView("/dashboard", "User Dashboard");
}

// Or track with additional properties
if (window.trackion) {
  window.trackion.pageView("/product/123", "Product Details", {
    product_id: "123",
    category: "electronics",
  });
}
```

## Privacy and Compliance

### Respecting User Privacy

Trackion is designed with privacy in mind:

- **No Personal Data** - No emails, names, or personal information
- **No Cross-Site Tracking** - Only tracks your domain
- **Anonymized IPs** - IP addresses are not stored
- **Do Not Track** - Respects browser DNT headers

### GDPR Compliance

For GDPR compliance:

1. **Cookie Banner** - Trackion doesn't use cookies, but you may still need consent
2. **Privacy Policy** - Update your privacy policy to mention analytics
3. **Opt-out Option** - Provide users a way to disable tracking

### Disable Tracking

Users can disable tracking by:

```javascript
// Disable Trackion tracking
localStorage.setItem("trackion-disabled", "true");

// Re-enable tracking
localStorage.removeItem("trackion-disabled");
```

## Custom Domains

For better privacy and reliability, serve the tracking script from your own domain:

### Nginx Proxy Example

```nginx
location /t.js {
    proxy_pass http://your-trackion-server:8080/t.js;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Then use:

```html
<script
  src="https://yoursite.com/t.js"
  data-project="your-project-key"
></script>
```

## Advanced Configuration

### Custom Event Properties

Add global properties to all events:

```javascript
// Set global properties
if (window.trackion) {
  window.trackion.setGlobalProperties({
    app_version: "1.0.0",
    environment: "production",
    user_type: "premium",
  });
}
```

### User Identification

Associate events with specific users:

```javascript
// Set user ID (after login)
if (window.trackion) {
  window.trackion.setUserId("user_12345");
}

// Clear user ID (after logout)
if (window.trackion) {
  window.trackion.clearUserId();
}
```

### Session Properties

Add properties that persist for the session:

```javascript
if (window.trackion) {
  window.trackion.setSessionProperty("experiment_group", "A");
  window.trackion.setSessionProperty("referral_code", "FRIEND20");
}
```

## Testing Your Implementation

### 1. Check Browser Console

Open browser dev tools and look for Trackion logs:

```
[Trackion] Page view tracked: /about
[Trackion] Event sent successfully
```

### 2. Verify in Dashboard

Visit your Trackion dashboard to see real-time data appearing.

### 3. Test with Network Tab

In browser dev tools, check the Network tab for requests to `/events`.

## Troubleshooting

### Script Not Loading

1. **Check the URL** - Ensure your Trackion server is accessible
2. **CORS Issues** - Verify CORS is configured for your domain
3. **Content Security Policy** - Add your Trackion domain to CSP

### No Data Appearing

1. **Project Key** - Confirm the project key is correct
2. **JavaScript Errors** - Check console for errors
3. **Ad Blockers** - Some users may have analytics blocked

### Performance Impact

The Trackion script is designed to be lightweight:

- **~2KB minified** - Minimal download size
- **Async Loading** - Doesn't block page rendering
- **Efficient Batching** - Groups multiple events together

## Best Practices

### 1. Load Early

Place the tracking script in the `<head>` for accurate timing:

```html
<head>
  <script src="https://your-server.com/t.js" data-project="key"></script>
</head>
```

### 2. Error Handling

Wrap trackion calls to handle offline scenarios:

```javascript
function safeTrack(eventName, properties) {
  try {
    if (window.trackion) {
      window.trackion.track(eventName, properties);
    }
  } catch (error) {
    console.warn("Analytics tracking failed:", error);
  }
}
```

### 3. Development vs Production

Use different tracking scripts for different environments:

```html
<!-- Development -->
<script src="http://localhost:8080/t.js" data-project="dev_key"></script>

<!-- Production -->
<script
  src="https://analytics.yoursite.com/t.js"
  data-project="prod_key"
></script>
```

## Next Steps

- [Custom Events](/guide/events) - Track specific actions
- [API Reference](/api/) - Complete API documentation
- [Projects](/guide/projects) - Organize your analytics
