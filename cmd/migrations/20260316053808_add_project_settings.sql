-- +goose Up

ALTER TABLE projects
ADD COLUMN auto_pageview BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN track_time_spent BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN track_campaign BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN track_clicks BOOLEAN NOT NULL DEFAULT false;


-- +goose Down

ALTER TABLE projects
DROP COLUMN auto_pageview,
DROP COLUMN track_time_spent,
DROP COLUMN track_campaign,
DROP COLUMN track_clicks,