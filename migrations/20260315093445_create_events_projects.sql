-- +goose Up
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    session_id TEXT,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_project_id ON events(project_id);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_project_created_at ON events(project_id, created_at);


-- +goose Down
DROP TABLE events;
DROP TABLE projects;
