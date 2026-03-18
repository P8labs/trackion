# Projects

Projects in Trackion help you organize and isolate analytics for different applications, environments, or teams.

## What are Projects?

Each project in Trackion represents a separate analytics context with:

- **Unique Project Key** - For tracking scripts and API calls
- **Isolated Data** - Events and analytics are completely separate
- **Independent Configuration** - Different settings per project
- **Access Control** - Manage who can view each project

## Creating Your First Project

### 1. Access the Dashboard

Open your Trackion dashboard at `http://localhost:5173` (or your deployed URL) and log in with your admin credentials.

### 2. Navigate to Projects

Click on **"Projects"** in the sidebar or navigation menu.

### 3. Create New Project

1. Click **"Create Project"**
2. Enter a **Project Name** (e.g., "My Website", "Mobile App", "Staging")
3. Add an optional **Description**
4. Click **"Create"**

### 4. Copy Your Project Key

After creation, you'll see your project key. **Copy this key** - you'll need it for tracking.

```
Example project key: proj_abc123def456
```

## Using Your Project Key

### For Website Tracking

Add the tracking script to your website with your project key:

```html
<script
  src="http://localhost:8080/t.js"
  data-project="proj_abc123def456"
></script>
```

### For Custom Events

Include the project key in API calls:

```bash
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "project": "proj_abc123def456",
    "name": "user.signup",
    "properties": {
      "user_id": "123"
    }
  }'
```

## Project Configuration

### Analytics Features

Each project can be configured with different tracking features:

- ✅ **Page Views** - Track page navigation (enabled by default)
- ✅ **Session Tracking** - Monitor user sessions and engagement
- ✅ **Custom Events** - Track specific actions via API
- ✅ **Performance Metrics** - Monitor page load times

::: tip Feature Configuration
Currently, all analytics features are enabled by default. Granular feature toggles will be added in future releases.
:::

### Data Retention

Configure how long to keep your analytics data:

- **30 days** - For testing and short-term projects
- **1 year** - For most production applications
- **Custom** - Set your own retention period

## Managing Projects

### Viewing Project Details

Click on any project to see:

- **Project Overview** - Key metrics and recent activity
- **Settings** - Configuration and project key
- **Analytics Dashboard** - Full analytics view
- **Event History** - Recent events and activity

### Updating Projects

1. Go to **Project Settings**
2. Update the name, description, or configuration
3. Click **"Save Changes"**

### Deleting Projects

::: warning Permanent Action
Deleting a project permanently removes all associated data. This cannot be undone.
:::

To delete a project:

1. Go to **Project Settings**
2. Scroll to **"Danger Zone"**
3. Click **"Delete Project"**
4. Confirm by typing the project name
5. Click **"Delete Forever"**

## Multiple Projects Use Cases

### 1. Environment Separation

```
Production Website    - proj_prod_web_123
Staging Website      - proj_stage_web_456
Development          - proj_dev_web_789
```

### 2. Application Separation

```
Main Website         - proj_website_123
Mobile App          - proj_mobile_456
Admin Dashboard     - proj_admin_789
API Service         - proj_api_abc
```

### 3. Team/Department Separation

```
Marketing Site      - proj_marketing_123
Product App         - proj_product_456
Support Portal      - proj_support_789
```

## Project Security

### Project Key Security

- **Keep project keys secure** - Don't commit them to public repositories
- **Use environment variables** - Store keys in environment variables
- **Rotate keys if compromised** - Generate new keys if needed

```bash
# Good ✅
export TRACKION_PROJECT_KEY=proj_abc123def456

# Avoid ❌
const projectKey = 'proj_abc123def456'; // hardcoded in source
```

### Access Control

- **Admin Access** - Full access to all projects and settings
- **Project Access** - View-only access to specific projects
- **API Access** - Send events but no dashboard access

::: tip Coming Soon
Granular user permissions and team management features are planned for future releases.
:::

## API Integration

### List Projects

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:8080/api/projects
```

### Get Project Details

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:8080/api/projects/proj_abc123def456
```

### Create Project via API

```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Project",
    "description": "Analytics for my app"
  }'
```

## Best Practices

### 1. Descriptive Naming

Use clear, descriptive names for your projects:

```
✅ Good
- "E-commerce Website - Production"
- "Mobile App - iOS"
- "Marketing Landing Pages"

❌ Avoid
- "Project 1"
- "Test"
- "App"
```

### 2. Environment Organization

Keep different environments as separate projects:

```
my-app-production
my-app-staging
my-app-development
```

### 3. Documentation

Document what each project tracks:

```
Project: E-commerce Website
Purpose: Track user behavior on main shopping site
Includes: Product views, purchases, cart abandonment
Team: Marketing & Product
```

### 4. Regular Review

- Review project list monthly
- Remove unused or test projects
- Update project descriptions as needed
- Audit project access permissions

## Troubleshooting

### Project Key Not Working

1. **Verify the key is correct** - Copy from dashboard, don't type manually
2. **Check the server URL** - Ensure tracking script URL is correct
3. **Confirm project exists** - Check in dashboard that project wasn't deleted

### No Data Appearing

1. **Check browser console** - Look for JavaScript errors
2. **Verify project key** - Ensure key matches exactly
3. **Test with custom event** - Send a test event via API
4. **Check network tab** - Confirm requests are being sent

### Dashboard Access Issues

1. **Verify authentication** - Ensure you're logged in
2. **Check project permissions** - Confirm access to specific project
3. **Clear browser cache** - Sometimes helps with loading issues

## Next Steps

- [Analytics Tracking](/guide/analytics) - Understanding your dashboard
- [Custom Events](/guide/events) - Track specific actions
- [API Reference](/api/projects) - Complete projects API
- [Self-hosting](/guide/self-hosting) - Deploy to production
