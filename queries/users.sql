-- name: CreateUser :one
INSERT INTO users (id, email, name, github_id, google_id, avatar_url)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetUser :one
SELECT *
FROM users
WHERE id = $1
LIMIT 1;

-- name: GetUserByEmail :one
SELECT *
FROM users
WHERE email = $1
LIMIT 1;

-- name: GetUserByGithubId :one
SELECT *
FROM users
WHERE github_id = $1
LIMIT 1;

-- name: GetUserByGoogleId :one
SELECT *
FROM users
WHERE google_id = $1
LIMIT 1;

-- name: UpdateUserFromGithub :exec
UPDATE users
SET
	email = $1,
	name = $2,
	avatar_url = $3
WHERE github_id = $4;

-- name: UpdateUserFromGoogle :exec
UPDATE users
SET
	email = $1,
	name = $2,
	avatar_url = $3
WHERE google_id = $4;

-- name: LinkGithubIDToUser :exec
UPDATE users
SET github_id = $1
WHERE id = $2;

-- name: LinkGoogleIDToUser :exec
UPDATE users
SET google_id = $1
WHERE id = $2;
