-- +goose Up
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    github_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free',
    monthly_event_limit INTEGER NOT NULL DEFAULT 100000,
    status TEXT NOT NULL DEFAULT 'active',
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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


CREATE INDEX idx_projects_owner_id
ON projects(owner_id);

CREATE INDEX idx_events_project_time
ON events(project_id, created_at);

CREATE INDEX idx_events_event_name
ON events(event_name);

CREATE INDEX idx_events_project_event
ON events(project_id, event_name);

CREATE INDEX idx_events_created_at
ON events(created_at);


-- +goose Down

DROP TABLE events;
DROP TABLE projects;
DROP TABLE subscriptions;
DROP TABLE users;