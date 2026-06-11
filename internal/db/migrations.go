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
		&types.Provider{},
		&types.VerificationCode{},
	)

	logger.Info("running custom migrations")

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
