-- name: CreateSubscription :one
INSERT INTO subscriptions (
    id,
    user_id,
    plan,
    monthly_event_limit,
    status,
    current_period_end
)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetActiveSubscriptionByUser :one
SELECT *
FROM subscriptions
WHERE user_id = $1
  AND status = 'active'
ORDER BY created_at DESC
LIMIT 1;

-- name: GetActiveSubscriptionLimitByProject :one
SELECT s.monthly_event_limit
FROM projects p
JOIN subscriptions s ON s.user_id = p.owner_id
WHERE p.id = $1
  AND s.status = 'active'
ORDER BY s.created_at DESC
LIMIT 1;

-- name: GetMonthlyUsageByProject :one
SELECT COUNT(e.id)::bigint AS usage_count
FROM events e
JOIN projects p ON p.id = e.project_id
WHERE p.id = $1
  AND e.created_at >= date_trunc('month', now());

-- name: GetMonthlyUsageByUser :one
SELECT COUNT(e.id)::bigint AS usage_count
FROM events e
JOIN projects p ON p.id = e.project_id
WHERE p.owner_id = $1
  AND e.created_at >= date_trunc('month', now());

-- name: RenewUserFreeSubscriptionIfNeeded :exec
UPDATE subscriptions
SET current_period_end = date_trunc('month', now()) + INTERVAL '1 month'
WHERE user_id = $1
  AND status = 'active'
  AND plan = 'free'
  AND (current_period_end IS NULL OR current_period_end <= now());

-- name: RenewFreeSubscriptionsForNewMonth :execrows
UPDATE subscriptions
SET current_period_end = date_trunc('month', now()) + INTERVAL '1 month'
WHERE status = 'active'
  AND plan = 'free'
  AND (current_period_end IS NULL OR current_period_end <= now());
