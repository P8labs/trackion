# Architecture

This page explains how Trackion is composed at runtime and how data moves through the system.

## High-Level Topology

Trackion consists of:

1. Go API server (`cmd/main.go` + `internal/*`)
2. PostgreSQL database
3. React web dashboard (`web/`)
4. Optional Tauri desktop client (`desktop/`)
5. Browser tracker assets served by API (`/t.js`, `/t.min.js`)

## Backend Composition

The API server is built around a single Chi router in `internal/app/app.go`.

### Middleware Stack

Global middleware includes:

- request ID
- real IP extraction
- request logging
- panic recovery
- timeout (`60s`)
- permissive CORS handler (`AllowAll` currently)

### Route Mounts

Public mounts:

- `/events` -> event ingestion + project config
- `/replay` -> replay ingestion
- `/v1` -> public runtime evaluation
- `/api/auth/verify` -> token verification
- `/health` -> health endpoint
- `/t.js`, `/t.min.js` -> tracker scripts

SaaS-only mounts:

- `/auth` -> OAuth login/callback/me/logout

Protected `/api` mounts (auth middleware applied):

- `/projects`
- `/runtime`
- `/analytics`
- `/replay` (private replay query/delete)
- `/errors`
- `/settings`
- `/billing`

## Authentication Architecture

Two runtime modes:

### Selfhost Mode

- configured by `TRACKION_MODE=selfhost`
- requires `TRACKION_ADMIN_TOKEN`
- `POST /api/auth/verify` validates token
- bearer auth on `/api/*` compares against admin token

### SaaS Mode

- configured by `TRACKION_MODE=saas`
- OAuth providers (GitHub + Google) enabled
- session tokens are created/stored in `sessions`
- bearer token can come from header and/or cookie depending on endpoint path

## Data Domains

Trackion stores and serves multiple telemetry domains:

1. Events (primary analytics records)
2. Runtime controls (feature flags + remote config)
3. Error groups/occurrences (via event_type + fingerprint)
4. Replay session/chunk data
5. Project/user/subscription metadata

## Event Ingestion Flow

1. Client sends `POST /events/collect` or `POST /events/batch`
2. Middleware validates project from `X-Project-Key`
3. Domain/origin checks run
4. Device and geo metadata are merged into properties
5. In SaaS mode, usage limits are checked and incremented
6. Event rows are persisted in `events`

## Runtime Evaluation Flow

1. Client requests `GET /v1/runtime?user_id=...`
2. Project is resolved from project key
3. Flags/config loaded from `flags` and `configs`
4. Partial rollouts are evaluated deterministically by `user_id`
5. Evaluated payload is returned to client

## Error Tracking Flow

1. Error event enters via event ingestion
2. Fingerprint metadata is stored in `events.properties`
3. Error API queries grouped fingerprints and occurrence timelines
4. Dedicated indexes accelerate error queries and fingerprint lookups

## Replay Flow

1. Client posts replay payload to `POST /replay/`
2. Request is validated and queued asynchronously
3. Session/chunk tables are updated
4. Dashboard uses private `/api/replay/projects/{id}/...` APIs for inspection

## Operational Components

### Migrations

Startup runs:

1. GORM automigrations for core models
2. custom index/subscription update SQL from `internal/db/migrations.go`

### Maintenance Worker

Background manager starts a maintenance job for retention and cleanup behavior controlled by env vars.

### Configuration

Config is loaded from env (`internal/config/config.go`) with defaults and safety guards.

## Scalability Considerations

- Stateless API server can scale horizontally
- DB query paths rely on composite indexes for project/time/event filters
- Replay and event retention should be tuned to storage profile
- Gateway-level rate limiting should complement app-level controls

## Security Considerations

1. Treat project API keys as write credentials
2. Protect admin/session bearer tokens
3. Place API behind TLS termination
4. Restrict network access to PostgreSQL
5. Add edge CORS and WAF policies for production

## See Also

- endpoint contracts: [API Reference](/api-reference)
- table/index detail: [Database Schema](/database-schema)
- deployment details: [Self Hosting](/self-hosting)
