# Database Schema

Complete documentation of Trackion PostgreSQL schema, including tables, indexes, and relationships.

## Overview

Trackion uses PostgreSQL 15+ with a normalized schema designed for analytics workloads. It stores users, projects, and events with index patterns optimized for read-heavy dashboards.

## Core Tables

### users

Stores user accounts, primarily for GitHub OAuth.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    github_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### subscriptions

Tracks plan and usage limits for SaaS scenarios.

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free',
    monthly_event_limit INTEGER NOT NULL DEFAULT 10000,
    status TEXT NOT NULL DEFAULT 'active',
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### projects

Defines projects and tracker settings.

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    auto_pageview BOOLEAN NOT NULL DEFAULT true,
    track_time_spent BOOLEAN NOT NULL DEFAULT true,
    track_campaign BOOLEAN NOT NULL DEFAULT true,
    track_clicks BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### events

Stores raw event telemetry and optional JSON properties.

```sql
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    session_id TEXT,
    page_path TEXT,
    page_title TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Relationship View

- `users` -> `subscriptions` (one-to-many)
- `users` -> `projects` (one-to-many)
- `projects` -> `events` (one-to-many)

## Performance Indexes

Recommended query indexes:

```sql
CREATE INDEX idx_events_project_time ON events(project_id, created_at);
CREATE INDEX idx_events_event_name ON events(event_name);
CREATE INDEX idx_events_project_event ON events(project_id, event_name);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
```

These cover common usage patterns:

- per-project dashboard summaries
- event-type breakdowns
- time-window analytics
- retention cleanup jobs
