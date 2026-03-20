# Introduction

Trackion helps you collect product events and view analytics in a self-hosted stack you control.

## Core Capabilities

- Event ingestion via /events/collect and /events/batch
- Project-level analytics dashboard APIs under /api/analytics/\*
- Per-project tracker configuration from /events/config
- Project CRUD under /api/projects/\*
- Usage summary under /api/settings/usage
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
2. Use [JavaScript API](/javascript-api) to instrument your app.
3. Use [Quick Start](/quick-start) for local setup.
4. Use [Self Hosting](/self-hosting) for Docker production deployment.
