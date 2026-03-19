-- name: CreateProject :one
INSERT INTO projects (id, name, api_key, owner_id, auto_pageview, track_time_spent, track_campaign, track_clicks, domains)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;


-- name: GetProjectByAPIKey :one
SELECT *
FROM projects
WHERE api_key = $1 AND status = 'active'
LIMIT 1;


-- name: GetProjectByID :one
SELECT *
FROM projects
WHERE id = $1 AND status = 'active'
LIMIT 1;


-- name: ListProjects :many
SELECT *
FROM projects
WHERE status = 'active'
ORDER BY created_at DESC;

-- name: GetUserProjects :many
SELECT *
FROM projects
WHERE owner_id = $1 AND status = 'active'
ORDER BY created_at DESC;


-- name: GetProjectConfig :one
SELECT auto_pageview, track_time_spent, track_campaign, track_clicks
FROM projects
WHERE id = $1 AND status = 'active'
LIMIT 1;

-- name: UpdateProject :exec
UPDATE projects
SET name = $2, auto_pageview = $3, track_time_spent = $4, track_campaign = $5, track_clicks = $6, domains = $7
WHERE id = $1;

-- name: DeleteProject :exec
UPDATE projects
SET status = 'deleted', deleted_at = NOW(), updated_at = NOW()
WHERE id = $1;

-- name: HardDeleteProjectsDeletedBefore :execrows
DELETE FROM projects
WHERE status = 'deleted'
	AND deleted_at IS NOT NULL
	AND deleted_at < $1;
