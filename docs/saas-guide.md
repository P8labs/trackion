# SaaS Guide

Use this guide to try Trackion quickly on hosted infrastructure before deciding to self-host.

## Why Start with SaaS First

- No database or Docker setup required
- Fast way to evaluate tracking and dashboard UX
- Useful for onboarding teammates before infra work

## What You Need

- A GitHub or Google account (for OAuth login)
- A browser and your app/site where you want to add tracking

## Option A: Use Hosted Dashboard (Recommended)

1. Open the hosted Trackion dashboard URL provided by the Trackion team.
2. Click GitHub or Google login.
3. Create a project.
4. Copy the project API key.
5. Add tracker script to your app.

Example script tag:

```html
<script
  src="https://api.trackion.tech/t.js"
  data-api-key="your-project-api-key"
></script>
```

6. Visit your site and trigger a few actions.
7. Check dashboard charts and recent events.

## Option B: Use Local Web UI Against SaaS API

If you want to test the current web code in this repository against SaaS API:

1. Run web with OAuth login enabled:

```bash
cd web
VITE_ENABLE_GITHUB_LOGIN=true VITE_ENABLE_GOOGLE_LOGIN=true VITE_SERVER_URL=https://api.trackion.tech VITE_TRACKION_MODE=saas pnpm dev
```

2. Open http://localhost:5173.
3. Keep Server URL as https://api.trackion.tech.
4. Click Google or GitHub login.
5. Complete OAuth and return to dashboard.

## Verify Tracking Works

After adding your script tag, verify:

- /events/config returns 200 in browser network tab
- /events/batch requests are sent and return 200
- Dashboard shows project counts and recent events

## Common SaaS Trial Issues

### OAuth buttons not visible in local web

Set `VITE_TRACKION_MODE=saas`, then enable one or both:

- `VITE_ENABLE_GITHUB_LOGIN=true`
- `VITE_ENABLE_GOOGLE_LOGIN=true`

### OAuth callback fails

Confirm you started login from the same serverUrl shown in the login form.

### No events appear

- Confirm data-api-key is correct
- Confirm script source points to SaaS API origin
- Disable aggressive adblock/privacy extensions temporarily

## Move to Self Hosting Later

Once your team validates event schema and dashboard workflow, switch to [Self Hosting](/self-hosting).

Typical migration flow:

1. Deploy self-host stack
2. Create projects and API keys
3. Replace tracker script source to your own API URL
4. Repoint frontend to your self-host API
