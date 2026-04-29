# Introduction

Trackion is a lightweight telemetry platform designed for teams that want fast analytics and operational controls with full infrastructure ownership.

It combines event collection, error tracking, session replay storage, runtime flag/config delivery, and dashboard analytics into one stack.

## What Trackion Solves

Trackion helps you answer product questions quickly:

- Which features are being used and by whom?
- Which pages and traffic sources drive conversions?
- What errors are happening in production right now?
- How can we roll out features safely with runtime controls?

Unlike vendor-locked analytics platforms, Trackion can run in your own environment and data boundary.

## Core Capabilities

### Event Ingestion

- `POST /events/collect`: single event ingestion
- `POST /events/batch`: batch ingestion
- `GET /events/config`: project tracker behavior config

Events support session, user, page, campaign, device, and arbitrary `properties` metadata.

### Runtime Controls (Feature Flags + Remote Config)

- Public runtime fetch: `GET /v1/runtime?user_id=...`
- Dashboard management:
  - `GET /api/runtime/projects/{id}/runtime`
  - `PUT/DELETE /api/runtime/projects/{id}/runtime/flags/{key}`
  - `PUT/DELETE /api/runtime/projects/{id}/runtime/config/{key}`

Rollout is deterministic when `rollout_percentage` is between 1 and 99 and `user_id` is supplied.

### Error Tracking

- `GET /api/errors`
- `GET /api/errors/{fingerprint}`
- `GET /api/errors/stats`

Errors are grouped using a fingerprint derived from error message + stack characteristics.

### Replay Ingestion + Query

- `POST /replay/`: ingest replay chunks
- `GET /api/replay/projects/{id}/sessions`
- `GET /api/replay/projects/{id}/sessions/{sessionId}`
- `DELETE /api/replay/projects/{id}/sessions/{sessionId}`

### Analytics + Project Management

- Project CRUD under `/api/projects/*`
- Analytics under `/api/analytics/*`
- Usage and billing summaries under `/api/settings/*` and `/api/billing/*`

## Runtime Modes

Trackion behavior changes depending on `TRACKION_MODE`.

### Selfhost Mode

- `TRACKION_MODE=selfhost`
- `TRACKION_ADMIN_TOKEN` is required
- Login path: `POST /api/auth/verify`
- Protected APIs accept `Authorization: Bearer <TRACKION_ADMIN_TOKEN>`

### SaaS Mode

- `TRACKION_MODE=saas`
- OAuth login routes are enabled:
  - `GET /auth/login/github`
  - `GET /auth/login/google`
  - `GET /auth/callback/github`
  - `GET /auth/callback/google`
- Session routes:
  - `GET /auth/me`
  - `POST /auth/logout`

## Technical Stack

- API server: Go 1.26 + Chi + GORM
- DB: PostgreSQL 15+
- Web dashboard: React + TypeScript + Vite
- Desktop client: Tauri + React
- Tracker assets: served by API at `/t.js` and `/t.min.js`

## Suggested Learning Order

1. Read [Architecture](/architecture) for system-level mental model.
2. Follow [Quick Start](/quick-start) to run locally.
3. Integrate a client via [SDK Usage](/sdk-usage).
4. Use [API Reference](/api-reference) for backend integrations.
5. Use [Self Hosting](/self-hosting) for production deployment.
