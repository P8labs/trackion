-- +goose Up
ALTER TABLE users
ADD COLUMN google_id TEXT;

CREATE UNIQUE INDEX idx_users_google_id_unique
ON users(google_id)
WHERE google_id IS NOT NULL;

ALTER TABLE subscriptions
ALTER COLUMN monthly_event_limit SET DEFAULT 10000;

UPDATE subscriptions
SET monthly_event_limit = 10000
WHERE plan = 'free'
  AND monthly_event_limit > 10000;

-- +goose Down
UPDATE subscriptions
SET monthly_event_limit = 100000
WHERE plan = 'free'
  AND monthly_event_limit = 10000;

ALTER TABLE subscriptions
ALTER COLUMN monthly_event_limit SET DEFAULT 100000;

DROP INDEX IF EXISTS idx_users_google_id_unique;

ALTER TABLE users
DROP COLUMN IF EXISTS google_id;
