# Self Hosting

This guide documents the real deployment path for Trackion in self-host mode.

## Deployment Model

Trackion self-hosting includes:

- PostgreSQL
- Go API server
- Optional separate web frontend deployment

The API serves tracker assets (/t.js, /t.min.js) and dashboard data APIs.

## 1. Prepare Environment

Copy template:

```bash
cp .env.selfhost.example .env.selfhost
```

At minimum, set secure values for:

- TRACKION_ADMIN_TOKEN
- AUTH_SECRET
- POSTGRES_PASSWORD

Important vars:

- TRACKION_MODE=selfhost
- BASE_URL and FRONTEND_URL
- CORS_ORIGINS
- retention settings:
  - EVENT_RETENTION_DAYS
  - PROJECT_DELETE_AFTER_DAYS

## 2. Docker Compose

Current docker-compose.yml includes db and may have server commented out depending on branch state.

If server is commented, uncomment it first.

Then run:

```bash
docker compose up -d --build
```

Verify:

```bash
docker compose ps
curl http://localhost:8000/health
```

## 3. Deploy Using Prebuilt Docker Image (GHCR)

If you do not want to build locally, use the published image from GitHub Container Registry.

1. Start only the database service:

```bash
docker compose up -d db
```

2. Pull a release image:

```bash
docker pull ghcr.io/p8labs/trackion:vX.Y.Z
```

3. Run the server container against the compose DB:

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
  ghcr.io/p8labs/trackion:vX.Y.Z
```

Notes:

- Replace vX.Y.Z with a real tag from releases.
- If your compose project name differs, adjust trackion_default network accordingly.

## 4. Deploy Using Prebuilt Binary (GitHub Releases)

If you prefer systemd or direct host execution, use release binaries.

1. Download binary for your platform (example: Linux AMD64):

```bash
VERSION=0.1.0
curl -fL -o trackion-server \
  "https://github.com/P8labs/trackion/releases/download/v${VERSION}/trackion-server_${VERSION}_linux_amd64"
chmod +x trackion-server
```

2. Create runtime env file:

```bash
cat > .env <<'EOF'
TRACKION_MODE=selfhost
PORT=8000
DATABASE_URL=postgres://trackion:trackion@localhost:5432/trackion?sslmode=disable
TRACKION_ADMIN_TOKEN=replace-with-long-random-token
AUTH_SECRET=replace-with-long-random-secret
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=*
EVENT_RETENTION_DAYS=30
PROJECT_DELETE_AFTER_DAYS=7
CLEANUP_CRON_SPEC=@every 1h
CLEANUP_TIMEOUT_SEC=300
EOF
```

3. Run:

```bash
set -a
source .env
set +a
./trackion-server
```

Optional install location:

```bash
sudo mv trackion-server /usr/local/bin/trackion-server
```

## 5. Frontend

Run web separately in production or development:

```bash
cd web
pnpm install
pnpm build
```

Serve web/dist with your static server and point it to your API URL.

## 6. Reverse Proxy and TLS

Recommended production setup:

- Put API behind Nginx/Caddy/Traefik
- Enforce HTTPS
- Restrict CORS to your frontend domain(s)
- Keep PostgreSQL private (no public exposure)

## 7. Backups and Upgrades

### Database backup

```bash
docker exec -t trackion-db pg_dump -U trackion trackion > trackion-backup.sql
```

### Upgrade flow

```bash
git pull
docker compose build --no-cache
docker compose up -d
```

## 8. Authentication in Self-host Mode

- Web login uses POST /api/auth/verify
- Token must equal TRACKION_ADMIN_TOKEN
- Protected APIs require Authorization: Bearer &lt;TRACKION_ADMIN_TOKEN&gt;

## 9. Troubleshooting

### API fails with missing env

Check .env.selfhost and confirm required variables are present.

### No events visible

- Verify project API key
- Verify tracker script uses data-api-key
- Check /events/config and /events/batch responses in browser network tab

### CORS errors

Set CORS_ORIGINS to your frontend origin list, comma-separated.
