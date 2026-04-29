# Self Hosting

This guide describes production-oriented self-host deployment for Trackion.

## Deployment Topology

Minimum components:

1. PostgreSQL database
2. Trackion API server
3. Web dashboard (optional separate deployment)

The API server exposes:

- ingestion routes (`/events`, `/replay`)
- dashboard routes (`/api/*`)
- runtime public route (`/v1/runtime`)
- tracker assets (`/t.js`, `/t.min.js`)

## Required Environment Variables

At minimum, set:

- `TRACKION_MODE=selfhost`
- `DATABASE_URL=postgres://...`
- `TRACKION_ADMIN_TOKEN=<long-random-token>`
- `AUTH_SECRET=<long-random-secret>`
- `BASE_URL=https://api.your-domain.com`
- `FRONTEND_URL=https://your-dashboard-domain.com`

Recommended operational vars:

- `EVENT_RETENTION_DAYS` (default `30`)
- `PROJECT_DELETE_AFTER_DAYS` (default `7`)
- `CLEANUP_CRON_SPEC` (default `@every 1h`)
- `CLEANUP_TIMEOUT_SEC` (default `300`)
- rate limit + geo lookup vars from [Quick Start](/quick-start)

## Recommended Deployment Path

For most teams, the best self-host path is:

1. PostgreSQL via Docker Compose
2. Trackion server from prebuilt GHCR image tied to a GitHub release tag

This avoids local image builds and keeps runtime aligned with published release artifacts.

## GitHub Releases and Docker Images

Trackion publishes release artifacts on GitHub:

- Server binaries (Linux/macOS/Windows)
- Desktop installers
- Updater metadata
- Docker image tags

Release assets:

- https://github.com/P8labs/trackion/releases

Container image:

- `ghcr.io/p8labs/trackion`

Tag strategy:

- Prefer pinned tags in production: `vX.Y.Z`
- `latest` is convenient for testing but less deterministic

## Option A: Prebuilt Container Image (Recommended)

Start database:

```bash
docker compose up -d db
```

Pull a released image:

```bash
docker pull ghcr.io/p8labs/trackion:latest
```

Run with your DB/network:

```bash
docker run -d \
  --name trackion-server \
  --restart unless-stopped \
  -p 8000:8000 \
  -e TRACKION_MODE=selfhost \
  -e PORT=8000 \
  -e DATABASE_URL="postgres://trackion:trackion@db:5432/trackion?sslmode=disable" \
  -e TRACKION_ADMIN_TOKEN="replace-with-long-random-token" \
  -e AUTH_SECRET="replace-with-long-random-secret" \
  -e BASE_URL="https://api.example.com" \
  -e FRONTEND_URL="https://app.example.com" \
  ghcr.io/p8labs/trackion:latest
```

## Option B: Docker Compose Build (Source-Based)

Current repository `docker-compose.yml` has `db` enabled and `server` commented.

### 1. Enable server service

Uncomment the `server` block in `docker-compose.yml`.

### 2. Set env values

Use shell env vars or configure the `env_file` target for the server service.

### 3. Start services

```bash
docker compose up -d --build
```

### 4. Verify

```bash
docker compose ps
curl -fsS http://localhost:8000/health
```

## Option C: Prebuilt Binary (From GitHub Release)

Download release binary:

```bash
VERSION=2.3.0
curl -fL -o trackion-server \
  "https://github.com/P8labs/trackion/releases/download/v${VERSION}/trackion-server_${VERSION}_linux_amd64"
chmod +x trackion-server
```

Run with environment:

```bash
set -a
source .env
set +a
./trackion-server
```

## Deploying the Web Dashboard

Build web app:

```bash
cd web
pnpm install --frozen-lockfile
pnpm run build
```

Serve `web/dist` from your static host or reverse proxy, and ensure users can reach your API `BASE_URL`.

## Reverse Proxy + TLS

Production recommendations:

1. Put API behind Nginx/Caddy/Traefik
2. Enforce HTTPS only
3. Keep PostgreSQL private (no public ingress)
4. Restrict allowed origins at edge/proxy layer
5. Add request size + rate limits at gateway level

## Authentication Model in Selfhost

- Login API: `POST /api/auth/verify`
- Credential: admin token
- Protected APIs: `Authorization: Bearer <TRACKION_ADMIN_TOKEN>`

## Backups

Database backup example:

```bash
docker exec -t trackion-db pg_dump -U trackion trackion > trackion-backup.sql
```

Restore example:

```bash
cat trackion-backup.sql | docker exec -i trackion-db psql -U trackion -d trackion
```

## Upgrades

From source deployment:

```bash
git pull
docker compose build --no-cache
docker compose up -d
```

For image/binary deployments, roll forward to next release tag and keep DB backups before upgrade.

## Production Hardening Checklist

1. Replace all dev secrets with generated values
2. Use managed PostgreSQL backups or scheduled dumps
3. Protect admin token distribution
4. Monitor API health and DB metrics
5. Rotate secrets on schedule
6. Test restore procedure quarterly

## Troubleshooting

### API does not boot

- Check `DATABASE_URL`
- Ensure DB network reachability
- Ensure `TRACKION_ADMIN_TOKEN` is set in selfhost mode

### Dashboard loads but no data

- Confirm frontend points to correct API URL
- Confirm bearer token is valid
- Verify project IDs in API requests

### Ingestion requests fail

- Validate `X-Project-Key`
- Check origin/domain restrictions for project
- Inspect batch rate limiting (`429`) responses
