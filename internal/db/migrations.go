package db

import (
	"log/slog"
	types "trackion/internal/db/models"

	"gorm.io/gorm"
)

func RunMigrations(db *gorm.DB, logger *slog.Logger) error {

	logger.Info("running auto migrations")

	db.AutoMigrate(
		&types.User{},
		&types.Subscription{},
		&types.Session{},
		&types.Project{},
		&types.Event{},
		&types.ReplaySession{},
		&types.ReplayChunk{},
		&types.Flag{},
		&types.Config{},
	)

	logger.Info("running custom migrations")

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
				ELSE 7 
			END,
			supports_rollout = CASE 
				WHEN plan = 'pro' THEN true 
				ELSE false 
			END,
			monthly_event_limit = CASE 
				WHEN plan = 'pro' THEN 200000 
				ELSE 10000 
			END
		WHERE max_projects = 3 AND max_config_keys = 10 AND error_retention_days = 7
	`).Error; err != nil {
		logger.Error("failed to update subscription limits", "error", err)
		return err
	}

	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_events_properties_fingerprint 
		ON events USING gin ((properties->'fingerprint'))
	`).Error; err != nil {
		logger.Error("failed to create fingerprint index", "error", err)
		return err
	}

	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_events_error_queries 
		ON events (project_id, event_type, created_at DESC)
		WHERE event_type = 'error'
	`).Error; err != nil {
		logger.Error("failed to create error queries index", "error", err)
		return err
	}

	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_events_project_retention 
		ON events (project_id, created_at)
	`).Error; err != nil {
		logger.Error("failed to create project retention index", "error", err)
		return err
	}

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
