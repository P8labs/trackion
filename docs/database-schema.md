# Database Schema

Documentation of Trackion PostgreSQL schema, including core tables, runtime-control tables, and common index patterns.

## Overview

Trackion uses PostgreSQL 15+ with a normalized schema designed for analytics workloads. It stores users, projects, events, sessions, and runtime-control data (feature flags/config) with indexes optimized for dashboard reads.

## Core Tables

### users

Stores user accounts, primarily for GitHub OAuth.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    github_id TEXT UNIQUE,
    google_id TEXT,
    avatar_url TEXT,
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
    domains TEXT[],
    status TEXT NOT NULL DEFAULT 'active',
    deleted_at TIMESTAMPTZ,
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
    event_type TEXT,
    user_id TEXT,
    session_id TEXT,
    page_path TEXT,
    page_title TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    user_agent TEXT,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### sessions

Stores authenticated SaaS user sessions.

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);
```

### flags

Project-scoped feature flags for runtime evaluation.

```sql
CREATE TABLE flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT false,
    rollout_percentage SMALLINT NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### configs

Project-scoped runtime JSON config values.

```sql
CREATE TABLE configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Relationship View

- `users` -> `subscriptions` (one-to-many)
- `users` -> `projects` (one-to-many)
- `projects` -> `events` (one-to-many)
- `projects` -> `flags` (one-to-many)
- `projects` -> `configs` (one-to-many)

## Performance Indexes

Recommended query indexes:

```sql
CREATE INDEX idx_events_project_time ON events(project_id, created_at);
CREATE INDEX idx_events_event_name ON events(event_name);
CREATE INDEX idx_events_project_event ON events(project_id, event_name);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX idx_flags_project_id ON flags(project_id);
CREATE INDEX idx_configs_project_id ON configs(project_id);
```

These cover common usage patterns:

- per-project dashboard summaries
- event-type breakdowns
- time-window analytics
- retention cleanup jobs
