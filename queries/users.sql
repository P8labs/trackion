-- name: CreateUser :one
INSERT INTO users (id, email, name, github_id, avatar_url)
VALUES ($1, $2, $3, $4, $5)
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

-- name: UpdateUserFromGithub :exec
UPDATE users
SET
	email = $1,
	name = $2,
	avatar_url = $3
WHERE github_id = $4;
