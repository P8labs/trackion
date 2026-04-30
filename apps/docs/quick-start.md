# Quick Start

This guide gets Trackion running locally in development mode.

If you only want to evaluate product behavior first, use [SaaS Guide](/saas-guide).

## Prerequisites

- Go `1.26+`
- PostgreSQL `15+`
- Node.js `22+`
- pnpm `10+`
- Docker + Docker Compose (recommended for local DB)

## Option A: Local Development (Recommended)

This runs API and web dashboard from source.

### 1. Start PostgreSQL

From repo root:

```bash
docker compose up -d db
```

### 2. Create `.env`

Create a root `.env` file:

```bash
cat > .env <<'EOF'
TRACKION_MODE=selfhost
PORT=8000
DATABASE_URL=postgres://trackion:trackion@localhost:5432/trackion?sslmode=disable

TRACKION_ADMIN_TOKEN=dev-admin-token
AUTH_SECRET=dev-auth-secret

BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=*

EVENT_RETENTION_DAYS=30
PROJECT_DELETE_AFTER_DAYS=7
CLEANUP_CRON_SPEC=@every 1h
CLEANUP_TIMEOUT_SEC=300

RATE_LIMIT_BATCH_PROJECT_RPS=10
RATE_LIMIT_BATCH_PROJECT_BURST=20
RATE_LIMIT_BATCH_IP_RPM=100
RATE_LIMIT_TTL_MIN=10
RATE_LIMIT_CLEANUP_SEC=60

GEO_LOOKUP_ENABLED=true
GEO_LOOKUP_PROVIDER=https://ipwho.is
GEO_LOOKUP_TIMEOUT_MS=350
GEO_CACHE_TTL_MIN=60
GEO_CLEANUP_SEC=300
EOF
```

### 3. Run API server

```bash
go run ./cmd
```

On startup, Trackion auto-runs DB migrations and custom indexes.

### 4. Run web dashboard

In another shell:

```bash
cd web
pnpm install
pnpm dev
```

### 5. Open and login

- Dashboard: `http://localhost:5173`
- Health: `http://localhost:8000/health`

Use login values in the web app:

- Server URL: `http://localhost:8000`
- Token: value from `TRACKION_ADMIN_TOKEN`

## Option B: API + DB in Docker

The provided compose file includes `db` enabled and `server` commented out by default.

Recommended for self-host users: run Trackion from the prebuilt Docker image published with GitHub releases (instead of building locally).

1. Start database only:

```bash
docker compose up -d db
```

2. Pull a released image tag from GHCR:

```bash
docker pull ghcr.io/p8labs/trackion:latest
```

3. Run server container:

```bash
docker run -d \
  --name trackion-server \
  --restart unless-stopped \
  --network trackion_default \
  -p 8000:8000 \
  -e TRACKION_MODE=selfhost \
  -e PORT=8000 \
  -e DATABASE_URL="postgres://trackion:trackion@db:5432/trackion?sslmode=disable" \
  -e TRACKION_ADMIN_TOKEN="replace-with-long-random-token" \
  -e AUTH_SECRET="replace-with-long-random-secret" \
  -e BASE_URL="http://localhost:8000" \
  -e FRONTEND_URL="http://localhost:5173" \
  ghcr.io/p8labs/trackion:latest
```

4. Continue with web dashboard (`web/pnpm dev`) or host your own frontend build.

If you want to build the server image locally instead, use compose server service:

1. Open `docker-compose.yml`
2. Uncomment the `server` service block
3. Ensure env values are set (either via shell env or `env_file` target)
4. Start services:

```bash
docker compose up -d --build
```

Then run web dashboard locally (`web/pnpm dev`) or host your own frontend build.

## Create Your First Project

1. Login to dashboard
2. Create project
3. Copy project API key
4. Use API key in script tag or SDK config

## Add the Tracker Script

```html
<script
  src="http://localhost:8000/t.js"
  data-api-key="PROJECT_API_KEY"
></script>
```

The script fetches project config from `/events/config` and sends events to `/events/batch`.

## Send a Test Event (API)

```bash
curl -X POST http://localhost:8000/events/collect \
  -H "Content-Type: application/json" \
  -H "X-Project-Key: PROJECT_API_KEY" \
  -d '{
    "project_key": "PROJECT_API_KEY",
    "event": "quick_start_test",
    "session_id": "session-1",
    "page": {
      "path": "/quick-start",
      "title": "Quick Start"
    },
    "utm": {
      "source": "docs",
      "medium": "guide",
      "campaign": "quick-start"
    },
    "properties": {
      "source": "docs"
    }
  }'
```

## Verify Everything Works

Checklist:

1. `GET /health` returns `status: ok`
2. Browser network shows `/events/config` and `/events/batch` with `200`
3. Dashboard counts and recent events update
4. Project analytics endpoints return data

## Common Issues

### API exits on startup

- Ensure `DATABASE_URL` is valid
- Ensure PostgreSQL is running
- Ensure `TRACKION_ADMIN_TOKEN` is set in selfhost mode

### Login fails with unauthorized

- Use exact `TRACKION_ADMIN_TOKEN` value
- Confirm frontend is pointing to the correct API URL

### Events do not appear

- Validate `X-Project-Key`
- Ensure payload uses `session_id` (snake_case)
- Confirm your project exists and is active

## Next Steps

- Production deployment: [Self Hosting](/self-hosting)
- SDK integrations: [SDK Usage](/sdk-usage)
- Endpoint contracts: [API Reference](/api-reference)

For release assets and exact image tags, see:

- GitHub Releases: https://github.com/P8labs/trackion/releases
- GHCR Image: `ghcr.io/p8labs/trackion`
