-- name: InsertEvent :one
INSERT INTO events (project_id, event_name, session_id, properties)
VALUES ($1, $2, $3, $4)
RETURNING id;


-- name: InsertEventsBatch :exec
INSERT INTO events ( project_id, event_name, session_id, properties)
SELECT
    unnest($1::uuid[]),
    unnest($2::text[]),
    unnest($3::text[]),
    unnest($4::jsonb[]);