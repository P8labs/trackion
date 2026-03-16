-- name: CreateUser :one
INSERT INTO users (id, email, name, github_id)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUser :one
SELECT *
FROM users
WHERE id = $1
LIMIT 1;

-- name: GetUserByGithubId :one
SELECT *
FROM users
WHERE github_id = $1
LIMIT 1;
