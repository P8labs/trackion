-- name: InsertEvent :one
INSERT INTO events (
    project_id,
    event_name,
    session_id,
    user_agent,
    page_path,
    page_title,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    properties
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
RETURNING id;


-- name: InsertEventsBatch :batchexec
INSERT INTO events (
    project_id,
    event_name,
    session_id,
    user_agent,
    page_path,
    page_title,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    properties
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, $11);

-- name: GetRecentEvents :many
SELECT *
FROM events
WHERE project_id = $1
ORDER BY created_at DESC
LIMIT $2;

-- name: GetTotalEventCount :one
SELECT COUNT(*) as count
FROM events
WHERE project_id = $1;

-- name: GetEventCountByName :many
SELECT event_name, COUNT(*) as count
FROM events
WHERE project_id = $1
GROUP BY event_name
ORDER BY count DESC;

-- name: GetEventsOverTime :many
SELECT DATE(created_at) as date, COUNT(*) as count
FROM events
WHERE project_id = $1 AND created_at >= NOW() - INTERVAL '14 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;

-- name: GetPageViewCount :one
SELECT COUNT(*) as count
FROM events
WHERE project_id = $1 AND event_name = 'pageview';

-- name: GetCustomEventCount :one
SELECT COUNT(*) as count
FROM events
WHERE project_id = $1 AND event_name != 'pageview' AND event_name != 'time_spent' AND event_name != 'click';

-- name: GetTimeSpentHours :one
SELECT COALESCE(CAST(SUM(CAST(properties->>'time_spent' AS NUMERIC)) / 3600.0 AS INTEGER), 0) as total_hours
FROM events
WHERE project_id = $1 AND event_name = 'time_spent';