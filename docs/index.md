---
layout: home

title: Trackion Documentation
titleTemplate: Product Analytics You Control
tagline: A lightweight telemetry stack for event tracking, runtime controls, error insights, and session replay.

hero:
  name: Trackion Documentation
  text: Self-Hosted Product Analytics
  tagline: Collect events, monitor errors, manage runtime flags/config, and keep ownership of your data.
  actions:
    - theme: brand
      text: Quick Start
      link: /quick-start
    - theme: alt
      text: API Reference
      link: /api-reference
    - theme: alt
      text: Architecture
      link: /architecture

features:
  - icon: 📡
    title: Event + Replay Ingestion
    details: Ingest telemetry over /events and replay streams over /replay using project-level API keys.
  - icon: 🚩
    title: Runtime Controls
    details: Deliver evaluated feature flags and remote config from /v1/runtime with deterministic rollout behavior.
  - icon: ⚠️
    title: Error Tracking
    details: Group and inspect captured errors under /api/errors with fingerprint-based querying.
  - icon: 📊
    title: Analytics APIs
    details: Query project analytics, trends, top pages, devices, traffic, geo, and online users.
  - icon: 🧱
    title: Simple Stack
    details: Go API + PostgreSQL + React dashboard + optional Tauri desktop client.
  - icon: 🔐
    title: Two Auth Modes
    details: Self-host token auth or SaaS OAuth sessions (GitHub/Google).
---

# Welcome

Trackion is a telemetry platform for product teams that want actionable analytics without sending critical data to third parties.

Use these docs to run Trackion locally, deploy it in production, integrate SDKs, and operate the platform safely.

## Choose Your Path

1. New to Trackion: start with [Introduction](/introduction)
2. Evaluate quickly (hosted): follow [SaaS Guide](/saas-guide)
3. Run your own stack: follow [Quick Start](/quick-start)
4. Deploy long-term: use [Self Hosting](/self-hosting)
5. Integrate clients: read [SDK Usage](/sdk-usage) and [JavaScript API](/javascript-api)
6. Build against APIs: use [API Reference](/api-reference)

## Documentation Map

### Getting Started

- [Introduction](/introduction)
- [SaaS Guide](/saas-guide)
- [Quick Start](/quick-start)
- [Self Hosting](/self-hosting)

### Integration + API

- [SDK Usage](/sdk-usage)
- [JavaScript API](/javascript-api)
- [API Reference](/api-reference)
- [Error Tracking API](/api/errors)

### Technical Deep Dives

- [Architecture](/architecture)
- [Database Schema](/database-schema)

### Desktop Client

- [Desktop Development Setup](/desktop-development)
- [Desktop Distribution](/desktop-distribution)
- [Auto-Updater Setup](/updater-setup)

## What You Run

Core services and components:

- API server: Go 1.26 + Chi router
- Database: PostgreSQL 15+
- Web dashboard: React + TypeScript + Vite
- Tracker assets: served by API at `/t.js` and `/t.min.js`
- Optional desktop app: Tauri (Windows-focused distribution)

Default local ports:

- API: `http://localhost:8000`
- Web dashboard dev: `http://localhost:5173`
- Desktop frontend dev (Tauri): `http://localhost:1420`
- PostgreSQL: `localhost:5432`

## Important Notes

- In self-host mode, `TRACKION_ADMIN_TOKEN` is required.
- In SaaS mode, OAuth providers are used and dashboard APIs require session tokens.
- The API currently applies permissive CORS middleware (`AllowAll`) globally; lock down network access with reverse proxy rules in production.
