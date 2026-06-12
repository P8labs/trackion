# Database Schema

Trackion uses PostgreSQL for transactional metadata and analytics-read workloads.

This page reflects the current schema derived from model auto-migrations and custom SQL migrations.

## Core Entity Groups

1. Identity and auth: `users`, `sessions`
2. Commercial limits: `subscriptions`
3. Product boundary: `projects`
4. Telemetry: `events`
5. Runtime control: `flags`, `configs`
6. Replay: `replay_sessions`, `replay_chunks`

## Table Reference

### `users`

OAuth-backed user accounts.

Key columns:

- `id` uuid PK
- `email` unique
- `github_id` unique nullable
- `google_id` unique nullable
- `avatar_url`, `name`
- `created_at`, `updated_at`

### `sessions`

SaaS auth sessions.

Key columns:

- `id` uuid PK
- `user_id` FK -> `users.id`
- `token` unique
- `created_at`, `expires_at`

### `subscriptions`

Usage and plan constraints.

Key columns:

- `id` uuid PK
- `user_id` FK -> `users.id`
- `plan`, `status`
- `monthly_event_limit`
- `events_used_this_month`
- `max_projects`, `max_config_keys`
- `error_retention_days`, `supports_rollout`
- period tracking timestamps

### `projects`

Project-level telemetry scope and config.

Key columns:

- `id` uuid PK
- `user_id` FK -> `users.id`
- `name`, `status`
- `api_key` unique
- `domains` jsonb
- `properties` jsonb (tracker settings, etc.)
- `event_retention_days`
- `created_at`, `updated_at`, `deleted_at`

### `events`

Primary telemetry table.

Key columns:

- `id` bigint PK
- `project_id` FK -> `projects.id`
- `event_name`, `event_type`
- `user_id`, `session_id`
- device dimensions: `platform`, `device`, `os_version`, `app_version`, `browser`
- page dimensions: `page_path`, `page_title`, `referrer`
- campaign dimensions: `utm_source`, `utm_medium`, `utm_campaign`
- `properties` jsonb
- `created_at`

### `flags`

Feature flag definitions per project.

Key columns:

- `id` uuid PK
- `project_id` FK -> `projects.id`
- `key`
- `enabled`
- `rollout_percentage`
- `created_at`, `updated_at`

### `configs`

Remote config values per project.

Key columns:

- `id` uuid PK
- `project_id` FK -> `projects.id`
- `key`
- `value` jsonb
- `created_at`, `updated_at`

### `replay_sessions`

Replay session metadata.

Key columns:

- `session_id` text PK
- `project_id` FK-like project reference
- `started_at`, `last_seen_at`

### `replay_chunks`

Chunked replay payload storage.

Key columns:

- `id` bigint PK
- `session_id`
- `project_id`
- `data` bytea
- `created_at`

## Relationships

- `users` 1:n `projects`
- `users` 1:n `sessions`
- `users` 1:n `subscriptions`
- `projects` 1:n `events`
- `projects` 1:n `flags`
- `projects` 1:n `configs`
- `projects` 1:n `replay_sessions`
- (`project_id`, `session_id`) scoped replay chunks

## Index Strategy

Trackion relies on composite indexes tuned for dashboard queries.

Notable indexes:

- events project/time: `idx_project_time`, `idx_events_project_retention`
- event grouping/filtering: `idx_project_event`, `idx_events_event_name`, `idx_events_event_type`
- segmentation fields: `idx_events_platform`, `idx_events_user_id`, `idx_events_session_id`, `idx_events_utm_source`
- error queries: `idx_events_error_queries` (partial index on `event_type='error'`)
- error fingerprint lookup: `idx_events_properties_fingerprint` (GIN on `properties->fingerprint`)
- runtime tables: `idx_flags_project_id`, `idx_configs_project_id`
- replay tables: `idx_replay_sessions_project_last_seen`, `idx_replay_chunks_project_session_created`

## Migration Behavior

On server startup:

1. GORM auto-migrates model tables
2. custom SQL applies indexing and subscription-limit normalization

This means schema evolves with application version; keep API and server binaries aligned with DB migration state.

## Retention and Data Growth

Retention-related config:

- `EVENT_RETENTION_DAYS`
- `PROJECT_DELETE_AFTER_DAYS`
- project-level `event_retention_days`

Recommended operations:

1. Monitor events row growth per project
2. Schedule backups before major upgrades
3. Vacuum/analyze regularly on high-ingest workloads
4. Partition events table if multi-tenant scale demands it

## Practical Query Guidance

For analytics jobs and custom SQL:

- always include `project_id`
- include time predicates on `created_at`
- prefer aggregating on indexed dimensions
- avoid full JSON scans when scalar columns exist

## Related Pages

- route and endpoint contracts: [API Reference](/api-reference)
- component-level view: [Architecture](/architecture)
