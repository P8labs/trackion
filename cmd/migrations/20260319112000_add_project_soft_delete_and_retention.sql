-- +goose Up
ALTER TABLE projects
ADD COLUMN status TEXT NOT NULL DEFAULT 'active',
ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);


-- +goose Down
DROP INDEX IF EXISTS idx_projects_deleted_at;
DROP INDEX IF EXISTS idx_projects_status;

ALTER TABLE projects
DROP COLUMN deleted_at,
DROP COLUMN status;
