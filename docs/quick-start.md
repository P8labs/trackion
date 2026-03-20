# Quick Start

This page covers the fastest real setup for this repository.

Want to evaluate Trackion before running infra? Start with [SaaS Guide](/saas-guide) first.

## Prerequisites

- Go 1.26+
- PostgreSQL 15+
- Node.js 20+
- Docker + Docker Compose (optional but recommended)

## Option A: Local Development (Go + Web)

### 1. Start PostgreSQL

```bash
docker compose up -d db
```

### 2. Create .env in repo root

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
EOF
```

### 3. Run backend

```bash
go run ./cmd
```

### 4. Run web app

```bash
cd web
pnpm install
pnpm dev
```

Open:

- Web: http://localhost:5173
- API health: http://localhost:8000/health

Login in the web app with:

- Server URL: http://localhost:8000
- Admin token: the value of TRACKION_ADMIN_TOKEN

## Option B: Docker Self-Host Stack

1. Copy the env template:

```bash
cp .env.selfhost.example .env.selfhost
```

2. Set secure values in .env.selfhost:

- TRACKION_ADMIN_TOKEN
- AUTH_SECRET
- POSTGRES_PASSWORD

3. Ensure server service is enabled in docker-compose.yml.

4. Start stack:

```bash
docker compose up -d --build
```

## Add Tracker Script

Use your project API key from the dashboard:

```html
<script
  src="http://localhost:8000/t.js"
  data-api-key="your-project-api-key"
></script>
```

## Send a Test Event

```bash
curl -X POST http://localhost:8000/events/collect \
  -H "Content-Type: application/json" \
  -H "X-Project-Key: your-project-api-key" \
  -d '{
    "eventName": "quick_start_test",
    "sessionId": "session-1",
    "pagePath": "/quick-start",
    "properties": {"source": "docs"}
  }'
```

Then open the dashboard to confirm the event appears.
