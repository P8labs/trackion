---
title: "Self Hosting"
---

# Self Hosting

Trackion can be deployed on your own infrastructure, giving you complete control over your data, storage, networking, and analytics stack.

Self-hosting is recommended for organizations with strict compliance requirements, internal deployments, air-gapped environments, or teams that prefer to manage their own infrastructure.

## Architecture

A self-hosted Trackion deployment consists of:

- Trackion Dashboard
- Trackion API Server
- PostgreSQL Database

```text
Clients
   │
   ▼
API Server
```

## Requirements

Minimum recommended specifications for server with offside database:

| Component      | Requirement    |
| -------------- | -------------- |
| CPU            | 1 vCPU         |
| Memory         | 512 MB RAM     |
| Database       | PostgreSQL 15+ |
| Docker Compose | Latest         |

For production workloads, allocate resources based on event volume and retention requirements.

## Quick Deployment

There are multiple ways to deploy API server.

::: tabs

== tab "Docker Compose (Recommended)"

Create a simple docker compose file where you want.

```yaml
# docker-compose.yaml
services:
  trackion:
    image: ghcr.io/p8labs/trackion:latest
    container_name: trackion_api
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      - trackion_db
    ports:
      - "8000:8000"
  db:
    container_name: trackion_db-db
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-trackion}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-trackion}
      POSTGRES_DB: ${POSTGRES_DB:-trackion}
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "pg_isready -U ${POSTGRES_USER:-trackion} -d ${POSTGRES_DB:-trackion}",
        ]
      interval: 5s
      timeout: 5s
      retries: 20
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - trackion-data:/var/lib/postgresql/data

volumes:
  trackion-data:
```

Start the Containers by running.

```bash
docker compose up -d
```

== tab "Prebuilt Binary"

Download release binary:

```bash
VERSION=4.0.3
curl -fL -o trackion_server \
  "https://github.com/P8labs/trackion/releases/download/v${VERSION}/trackion-server_${VERSION}_linux_amd64"

chmod +x trackion_server
```

Run with Environment Variables

```bash
set -a
source .env
set +a
./trackion-server
```

:::

## Environment Variables

### Minimum Configuration Required

Create a `.env` file with these.

```env
DATABASE_URL="postgresql://trackion:trackion@localhost:5432/trackion"
BASE_URL="https://localhost:8000" # skip if same default
FRONTEND_URL="https://trackion.tech" # default is http://localhost:1420
```

## Health Checks

Trackion exposes health endpoints for monitoring.

```bash
curl http://localhost:8000/health
```
