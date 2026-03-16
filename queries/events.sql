-- name: InsertEvent :one
INSERT INTO events (
    project_id,
    event_name,
    session_id,
    page_path,
    page_title,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    properties
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
RETURNING id;


-- name: InsertEventsBatch :batchexec
INSERT INTO events (
    project_id,
    event_name,
    session_id,
    page_path,
    page_title,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    properties
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);