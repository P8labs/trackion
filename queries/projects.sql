-- name: CreateProject :one
INSERT INTO projects (id, name, api_key, owner_id)
VALUES ($1, $2, $3, $4)
RETURNING *;


-- name: GetProjectByAPIKey :one
SELECT *
FROM projects
WHERE api_key = $1
LIMIT 1;


-- name: GetProjectByID :one
SELECT *
FROM projects
WHERE id = $1
LIMIT 1;


-- name: ListProjects :many
SELECT *
FROM projects
ORDER BY created_at DESC;

-- name: GetUserProjects :many
SELECT *
FROM projects
WHERE owner_id = $1
ORDER BY created_at DESC;


-- name: GetProjectConfig :one
SELECT auto_pageview, track_time_spent, track_campaign, track_clicks
FROM projects
WHERE api_key = $1
LIMIT 1;
