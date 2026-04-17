package db

import (
	"log/slog"

	"gorm.io/gorm"
)

// RunMigrations applies custom migrations that can't be handled by GORM AutoMigrate
func RunMigrations(db *gorm.DB, logger *slog.Logger) error {
	logger.Info("running custom migrations")

	// Add usage tracking fields to subscriptions table
	if err := db.Exec(`
		ALTER TABLE subscriptions 
		ADD COLUMN IF NOT EXISTS events_used_this_month INTEGER DEFAULT 0,
		ADD COLUMN IF NOT EXISTS projects_used INTEGER DEFAULT 0,
		ADD COLUMN IF NOT EXISTS last_usage_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	`).Error; err != nil {
		logger.Error("failed to add subscription usage fields", "error", err)
		return err
	}

	// Add plan limit fields to subscriptions table
	if err := db.Exec(`
		ALTER TABLE subscriptions 
		ADD COLUMN IF NOT EXISTS max_projects INTEGER DEFAULT 3,
		ADD COLUMN IF NOT EXISTS max_config_keys INTEGER DEFAULT 10,
		ADD COLUMN IF NOT EXISTS error_retention_days INTEGER DEFAULT 3,
		ADD COLUMN IF NOT EXISTS supports_rollout BOOLEAN DEFAULT false
	`).Error; err != nil {
		logger.Error("failed to add subscription limit fields", "error", err)
		return err
	}

	// Update existing subscriptions with proper plan limits
	if err := db.Exec(`
		UPDATE subscriptions 
		SET 
			max_projects = CASE 
				WHEN plan = 'pro' THEN 5 
				ELSE 3 
			END,
			max_config_keys = CASE 
				WHEN plan = 'pro' THEN -1 
				ELSE 10 
			END,
			error_retention_days = CASE 
				WHEN plan = 'pro' THEN 14 
				ELSE 3 
			END,
			supports_rollout = CASE 
				WHEN plan = 'pro' THEN true 
				ELSE false 
			END,
			monthly_event_limit = CASE 
				WHEN plan = 'pro' THEN 200000 
				ELSE 10000 
			END
		WHERE max_projects = 3 AND max_config_keys = 10 AND error_retention_days = 3
	`).Error; err != nil {
		logger.Error("failed to update subscription limits", "error", err)
		return err
	}

	// Add retention days to projects table
	if err := db.Exec(`
		ALTER TABLE projects 
		ADD COLUMN IF NOT EXISTS event_retention_days INTEGER DEFAULT 30
	`).Error; err != nil {
		logger.Error("failed to add project retention field", "error", err)
		return err
	}

	// Initialize project counts in existing subscriptions
	if err := db.Exec(`
		UPDATE subscriptions 
		SET projects_used = (
			SELECT COUNT(*) 
			FROM projects 
			WHERE projects.user_id = subscriptions.user_id 
			AND projects.deleted_at IS NULL
		)
		WHERE projects_used = 0
	`).Error; err != nil {
		logger.Error("failed to initialize project counts", "error", err)
		return err
	}

	// Create GIN index on properties JSONB for fast error fingerprint lookups
	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_events_properties_fingerprint 
		ON events USING gin ((properties->'fingerprint'))
	`).Error; err != nil {
		logger.Error("failed to create fingerprint index", "error", err)
		return err
	}

	// Create composite index for error queries (project_id, event_type, created_at)
	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_events_error_queries 
		ON events (project_id, event_type, created_at DESC)
		WHERE event_type = 'error'
	`).Error; err != nil {
		logger.Error("failed to create error queries index", "error", err)
		return err
	}

	// Create index for project retention cleanup
	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_events_project_retention 
		ON events (project_id, created_at)
	`).Error; err != nil {
		logger.Error("failed to create project retention index", "error", err)
		return err
	}

	// Create indexes for replay session listing and chunk playback reads
	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_replay_sessions_project_last_seen
		ON replay_sessions (project_id, last_seen_at DESC)
	`).Error; err != nil {
		logger.Error("failed to create replay sessions index", "error", err)
		return err
	}

	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_replay_chunks_project_session_created
		ON replay_chunks (project_id, session_id, created_at)
	`).Error; err != nil {
		logger.Error("failed to create replay chunks index", "error", err)
		return err
	}

	logger.Info("custom migrations completed successfully")
	return nil
}
