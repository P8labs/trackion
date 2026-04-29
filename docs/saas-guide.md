# SaaS Guide

This guide helps you evaluate Trackion quickly using the hosted API/dashboard experience, then move to self-hosting when you are ready.

## Why Start with SaaS

- Zero infrastructure setup
- Fastest way to test event schema and dashboards
- Useful for product/demo validation before operating your own stack

## Prerequisites

- GitHub or Google account (for OAuth login)
- Access to your website/app where you can add a script or SDK

## Hosted Evaluation Flow

1. Open hosted Trackion dashboard/API domain
2. Sign in with GitHub or Google
3. Create a project
4. Copy the project API key
5. Add tracker integration
6. Generate traffic/events
7. Validate analytics + errors + runtime behavior

## Add Tracker Script (Hosted)

```html
<script
  src="https://api.trackion.tech/t.js"
  data-api-key="PROJECT_API_KEY"
></script>
```

Then emit a manual event:

```js
trackion.track("saas_guide_test", { source: "docs" });
```

## Validate End-to-End

In browser devtools network tab, verify:

1. `GET /events/config` returns `200`
2. `POST /events/batch` returns `200`
3. Payload includes expected event names and properties

In dashboard, verify:

1. Recent events includes your test event
2. Counts/charts update after short delay
3. Top pages / traffic sources populate if page/referrer data exists

## Local Web App Against SaaS API

To test this repository web app against hosted backend:

```bash
cd web
VITE_TRACKION_MODE=saas \
VITE_SERVER_URL=https://api.trackion.tech \
VITE_ENABLE_GITHUB_LOGIN=true \
VITE_ENABLE_GOOGLE_LOGIN=true \
pnpm dev
```

Open `http://localhost:5173`, keep server URL as hosted API, and complete OAuth login.

## Runtime Controls in SaaS

Once project data is flowing:

1. Create/update flags and config in project runtime section
2. Fetch runtime from client (`/v1/runtime`)
3. Validate rollout behavior using stable `user_id` values

## Common Issues

### OAuth buttons missing

Set:

- `VITE_TRACKION_MODE=saas`
- `VITE_ENABLE_GITHUB_LOGIN=true` and/or `VITE_ENABLE_GOOGLE_LOGIN=true`

### OAuth callback fails

- Ensure login starts from the same API base URL used by app
- Ensure callback domain/origin settings are correct for hosted environment

### No data appears

- Verify project API key
- Ensure script URL points to hosted API domain
- Check browser extensions blocking requests

## Migrating from SaaS to Selfhost

1. Deploy self-host stack ([Self Hosting](/self-hosting))
2. Recreate projects and copy new API keys
3. Update script/SDK `serverUrl` and keys
4. Point dashboard to your self-host API
5. Revalidate `/events/config`, ingestion, and dashboard APIs

## Recommendation

Use SaaS for onboarding and schema iteration, then move to self-host for data residency and infrastructure control.
