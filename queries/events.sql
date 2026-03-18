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
WHERE project_id = $1
  AND created_at >= NOW() - ($2 * INTERVAL '1 day')
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

-- name: GetDashboardStats :one
SELECT
    COUNT(*) AS total_events,

    SUM(CASE 
        WHEN event_name = 'pageview' THEN 1 
        ELSE 0 
    END) AS page_views,

    COUNT(DISTINCT CASE 
        WHEN event_name = 'pageview' THEN session_id 
    END) AS unique_views,

    -- total time in milliseconds
    SUM(CASE 
        WHEN event_name = 'time_spent' THEN 
            (properties->>'duration_ms')::BIGINT
        ELSE 0
    END) AS total_time_ms,

    COUNT(DISTINCT CASE 
        WHEN event_name = 'time_spent' THEN session_id 
    END) AS time_spent_sessions

FROM events
WHERE project_id = $1;

-- name: GetEventsOverTimeFiltered :many
SELECT
    DATE_TRUNC($3, created_at)::timestamptz as period,
    COUNT(*) as count
FROM events
WHERE project_id = $1
  AND created_at >= $2
  AND ($4 = '' OR event_name = $4)
GROUP BY DATE_TRUNC($3, created_at)
ORDER BY period ASC;

-- name: GetEventsOverTimeFilteredCustomRange :many
SELECT
    (CASE
        WHEN $4 = 'hour' THEN DATE_TRUNC('hour', created_at)
        WHEN $4 = 'minute' THEN DATE_TRUNC('minute', created_at)
        ELSE DATE_TRUNC('day', created_at)
    END)::timestamptz as period,
    COUNT(*) as count
FROM events
WHERE project_id = $1
  AND created_at >= $2
  AND created_at <= $3
  AND ($5 = '' OR event_name = $5)
GROUP BY
    CASE
        WHEN $4 = 'hour' THEN DATE_TRUNC('hour', created_at)
        WHEN $4 = 'minute' THEN DATE_TRUNC('minute', created_at)
        ELSE DATE_TRUNC('day', created_at)
    END
ORDER BY period ASC;

-- name: GetDeviceBreakdown :many
WITH parsed_agents as (
    SELECT
        CASE
            WHEN user_agent ILIKE '%windows%' THEN 'Windows'
            WHEN user_agent ILIKE '%macintosh%' OR user_agent ILIKE '%mac os%' THEN 'Mac'
            WHEN user_agent ILIKE '%linux%' AND user_agent NOT ILIKE '%android%' THEN 'Linux'
            WHEN user_agent ILIKE '%iphone%' OR user_agent ILIKE '%ipad%' THEN 'iOS'
            WHEN user_agent ILIKE '%android%' THEN 'Android'
            ELSE 'Other'
        END as device_os,
        CASE
            WHEN user_agent ILIKE '%chrome%' AND user_agent NOT ILIKE '%edge%' THEN 'Chrome'
            WHEN user_agent ILIKE '%firefox%' THEN 'Firefox'
            WHEN user_agent ILIKE '%safari%' AND user_agent NOT ILIKE '%chrome%' THEN 'Safari'
            WHEN user_agent ILIKE '%edge%' THEN 'Edge'
            ELSE 'Other'
        END as browser
    FROM events
    WHERE project_id = $1 AND event_name = 'pageview'
)
SELECT
    device_os as name,
    COUNT(*) as count,
    'device' as category
FROM parsed_agents
GROUP BY device_os
UNION ALL
SELECT
    browser as name,
    COUNT(*) as count,
    'browser' as category
FROM parsed_agents
GROUP BY browser
ORDER BY category, count DESC;

-- name: GetReferrerBreakdown :many
WITH referrer_data as (
    SELECT
        CASE
            WHEN referrer = '' OR referrer IS NULL THEN 'Direct'
            WHEN referrer ILIKE '%google%' THEN 'Google'
            WHEN referrer ILIKE '%youtube%' THEN 'YouTube'
            WHEN referrer ILIKE '%facebook%' THEN 'Facebook'
            WHEN referrer ILIKE '%twitter%' OR referrer ILIKE '%x.com%' THEN 'Twitter/X'
            WHEN referrer ILIKE '%instagram%' THEN 'Instagram'
            WHEN referrer ILIKE '%linkedin%' THEN 'LinkedIn'
            ELSE 'Other'
        END as source
    FROM events
    WHERE project_id = $1 AND event_name = 'pageview'
)
SELECT
    source as name,
    COUNT(*) as count
FROM referrer_data
GROUP BY source
ORDER BY count DESC;

-- name: GetUTMBreakdown :many
SELECT
    COALESCE(utm_source, 'Direct') as utm_source,
    COALESCE(utm_medium, 'None') as utm_medium,
    COALESCE(utm_campaign, 'None') as utm_campaign,
    COUNT(*) as count
FROM events
WHERE project_id = $1 AND event_name = 'pageview'
GROUP BY utm_source, utm_medium, utm_campaign
ORDER BY count DESC
LIMIT 20;

-- name: GetTopPagesBreakdown :many
SELECT
    page_path as name,
    COUNT(*) as count,
    COUNT(DISTINCT session_id) as unique_views
FROM events
WHERE project_id = $1 AND event_name = 'pageview'
GROUP BY page_path
ORDER BY count DESC
LIMIT 20;

-- name: GetRecentEventsLimited :many
SELECT
    id,
    event_name,
    session_id,
    page_path,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    properties,
    created_at
FROM events
WHERE project_id = $1
ORDER BY created_at DESC
LIMIT $2;

-- Dashboard Stats API (counts only)
-- name: GetDashboardCounts :one
SELECT
    COUNT(*) AS total_events,

    SUM(CASE 
        WHEN event_name = 'pageview' THEN 1 
        ELSE 0 
    END) AS page_views,

    COUNT(DISTINCT CASE 
        WHEN event_name = 'pageview' THEN session_id 
    END) AS unique_views,

    -- total time in milliseconds
    SUM(CASE 
        WHEN event_name = 'time_spent' THEN 
            (properties->>'duration_ms')::BIGINT
        ELSE 0
    END) AS total_time_ms,

    COUNT(DISTINCT CASE 
        WHEN event_name = 'time_spent' THEN session_id 
    END) AS time_spent_sessions
FROM events
WHERE project_id = $1;    

-- Chart Data with flexible time range and event filtering  
-- name: GetChartDataFlexible :many
SELECT
    DATE_TRUNC($3, created_at)::timestamptz as period,
    COUNT(*) as count
FROM events
WHERE project_id = $1
  AND created_at >= $2
  AND ($4 = '' OR $4 IS NULL OR event_name = $4)
GROUP BY DATE_TRUNC($3, created_at)
ORDER BY period ASC;

-- Breakdown Data - Device/Browser Analysis
-- name: GetDeviceAnalytics :many
WITH user_agents as (
    SELECT DISTINCT session_id, user_agent
    FROM events
    WHERE project_id = $1 AND event_name = 'pageview'
)
SELECT
    CASE
        WHEN user_agent ILIKE '%windows%' THEN 'Windows'
        WHEN user_agent ILIKE '%macintosh%' OR user_agent ILIKE '%mac os%' THEN 'macOS'
        WHEN user_agent ILIKE '%linux%' AND user_agent NOT ILIKE '%android%' THEN 'Linux'
        WHEN user_agent ILIKE '%iphone%' OR user_agent ILIKE '%ipad%' THEN 'iOS'
        WHEN user_agent ILIKE '%android%' THEN 'Android'
        ELSE 'Other'
    END as device_name,
    'device' as category,
    COUNT(*) as count
FROM user_agents
GROUP BY device_name
UNION ALL
SELECT
    CASE
        WHEN user_agent ILIKE '%chrome%' AND user_agent NOT ILIKE '%edge%' THEN 'Chrome'
        WHEN user_agent ILIKE '%firefox%' THEN 'Firefox'
        WHEN user_agent ILIKE '%safari%' AND user_agent NOT ILIKE '%chrome%' THEN 'Safari'
        WHEN user_agent ILIKE '%edge%' THEN 'Edge'
        WHEN user_agent ILIKE '%opera%' THEN 'Opera'
        ELSE 'Other'
    END as device_name,
    'browser' as category,
    COUNT(*) as count
FROM user_agents
GROUP BY device_name
ORDER BY category, count DESC;

-- Breakdown Data - Traffic Sources
-- name: GetTrafficSources :many
WITH traffic_data as (
    SELECT DISTINCT
        session_id,
        CASE
            WHEN referrer = '' OR referrer IS NULL THEN 'Direct'
            WHEN referrer ILIKE '%google%' THEN 'Google'
            WHEN referrer ILIKE '%youtube%' THEN 'YouTube'
            WHEN referrer ILIKE '%facebook%' THEN 'Facebook'
            WHEN referrer ILIKE '%twitter%' OR referrer ILIKE '%x.com%' THEN 'X (Twitter)'
            WHEN referrer ILIKE '%instagram%' THEN 'Instagram'
            WHEN referrer ILIKE '%linkedin%' THEN 'LinkedIn'
            WHEN referrer ILIKE '%github%' THEN 'GitHub'
            ELSE 'Other'
        END as source,
        utm_source,
        utm_medium,
        utm_campaign
    FROM events
    WHERE project_id = $1 AND event_name = 'pageview'
)
SELECT
    source as name,
    COUNT(*) as count,
    'referrer' as category
FROM traffic_data
GROUP BY source
UNION ALL
SELECT
    COALESCE(utm_source, 'None') as name,
    COUNT(*) as count,
    'utm_source' as category
FROM traffic_data
WHERE utm_source IS NOT NULL
GROUP BY utm_source
UNION ALL
SELECT
    COALESCE(utm_medium, 'None') as name,
    COUNT(*) as count,
    'utm_medium' as category
FROM traffic_data
WHERE utm_medium IS NOT NULL
GROUP BY utm_medium
ORDER BY category, count DESC;

-- Breakdown Data - Top Pages
-- name: GetTopPages :many
SELECT
    page_path as path,
    COUNT(*) as total_views,
    COUNT(DISTINCT session_id) as unique_visitors,
    ROUND(AVG(CASE WHEN event_name = 'time_spent' THEN
        CAST(properties->>'duration_ms' AS NUMERIC) / 1000.0
    END), 2) as avg_time_seconds
FROM events
WHERE project_id = $1 AND page_path IS NOT NULL
GROUP BY page_path
ORDER BY total_views DESC
LIMIT 10;

-- Recent Events with better formatting
-- name: GetRecentEventsFormatted :many
SELECT
    id,
    event_name,
    session_id,
    page_path,
    CASE
        WHEN referrer = '' OR referrer IS NULL THEN 'Direct'
        ELSE referrer
    END as referrer_source,
    properties,
    created_at
FROM events
WHERE project_id = $1
ORDER BY created_at DESC
LIMIT $2;