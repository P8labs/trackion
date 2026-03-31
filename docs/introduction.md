# Introduction

Trackion helps you collect product events and view analytics in a self-hosted stack you control.

## Core Capabilities

- Event ingestion via /events/collect and /events/batch
- Runtime control via /v1/runtime and /api/runtime/projects/{id}/runtime
- Project-level analytics dashboard APIs under /api/analytics/\*
- Per-project tracker configuration from /events/config
- Project CRUD under /api/projects/\*
- Usage summary under /api/settings/usage
- SDK package family: @trackion/web, @trackion/web/react, @trackion/web/vue, @trackion/web/node
- Browser tracker script at /t.js and /t.min.js

## Authentication Modes

Trackion supports two runtime modes:

### Self-host Mode

- TRACKION_MODE=selfhost
- Login uses POST /api/auth/verify with TRACKION_ADMIN_TOKEN
- Protected dashboard APIs use Authorization: Bearer &lt;admin-token&gt;

### SaaS Mode

- TRACKION_MODE=saas
- GitHub OAuth endpoints:
  - GET /auth/login/github
  - GET /auth/callback/github
- Session/user endpoints:
  - GET /auth/me
  - POST /auth/logout

## Stack

- Backend: Go + Chi + pgx
- Database: PostgreSQL
- Frontend: React + TypeScript + Vite
- Tracking: Embedded static script served by the Go API

## Recommended Path

1. Try hosted mode first via [SaaS Guide](/saas-guide).
2. Use [SDK Usage](/sdk-usage) for npm/script integration patterns.
3. Use [JavaScript API](/javascript-api) for script-level behavior and ingestion details.
4. Use [Quick Start](/quick-start) for local setup.
5. Use [Self Hosting](/self-hosting) for Docker production deployment.
