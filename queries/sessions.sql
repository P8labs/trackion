-- name: CreateSession :one
INSERT INTO sessions (id, user_id, token, expires_at)
VALUES ($1, $2, $3, $4)
RETURNING *;


-- name: GetSessionByToken :one
SELECT *
FROM sessions
WHERE token = $1
AND expires_at > now()
LIMIT 1;


-- name: DeleteSession :exec
DELETE FROM sessions
WHERE token = $1;


-- name: DeleteUserSessions :exec
DELETE FROM sessions
WHERE user_id = $1;


-- name: CleanupExpiredSessions :exec
DELETE FROM sessions
WHERE expires_at < now();