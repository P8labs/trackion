-- +goose Up
ALTER TABLE users
ADD COLUMN avatar_url TEXT;

-- +goose Down
ALTER TABLE users
DROP COLUMN avatar_url;