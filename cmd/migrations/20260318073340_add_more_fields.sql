-- +goose Up
ALTER TABLE projects
ADD COLUMN domains TEXT[],
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE events
ADD COLUMN user_agent TEXT;


-- +goose Down
ALTER TABLE projects
DROP COLUMN domains,
DROP COLUMN updated_at;

ALTER TABLE events
DROP COLUMN user_agent;