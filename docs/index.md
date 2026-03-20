---
layout: home

title: Trackion Documentation
titleTemplate: Open Source Product Analytics
tagline: Lightweight event tracking, modern dashboards, and complete data ownership.

hero:
  name: Trackion Documentation
  text: Open Source Product Analytics
  tagline: Lightweight event tracking, modern dashboards, and complete data ownership.
  actions:
    - theme: brand
      text: Quick Start
      link: /quick-start
    - theme: alt
      text: API Reference
      link: /api-reference

features:
  - icon: 📡
    title: Event Ingestion
    details: Collect single or batch events via /events/collect and /events/batch with project-key auth.
  - icon: 📊
    title: Built-in Analytics
    details: Use dashboard APIs for counts, charts, top pages, traffic sources, and recent events.
  - icon: 🛠️
    title: Self-Host Friendly
    details: Run with Go, PostgreSQL, and Docker while keeping tracking data fully in your own control.
---

# Start Here

- [Introduction](/introduction)
- [SaaS Guide](/saas-guide)
- [Quick Start](/quick-start)
- [Self Hosting](/self-hosting)
- [API Reference](/api-reference)
- [JavaScript API](/javascript-api)
- [Architecture](/architecture)
- [Database Schema](/database-schema)

## What You Get

- Go backend with PostgreSQL
- Event ingestion endpoints for browser/server tracking
- Dashboard APIs for projects, analytics, and usage
- Token login for self-host mode and GitHub OAuth for SaaS mode
- Tracker script served by your own server at /t.js and /t.min.js

## Quick Reality Check

Current default local ports:

- API: http://localhost:8000
- Web app (Vite dev): http://localhost:5173
- PostgreSQL: localhost:5432

Use [SaaS Guide](/saas-guide) to try Trackion first, then follow [Quick Start](/quick-start) and [Self Hosting](/self-hosting) when you are ready to run your own stack.
