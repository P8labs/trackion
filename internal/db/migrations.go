package db

import (
	"log/slog"

	"gorm.io/gorm"
)

// RunMigrations applies custom migrations that can't be handled by GORM AutoMigrate
func RunMigrations(db *gorm.DB, logger *slog.Logger) error {
	logger.Info("running custom migrations")

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

	logger.Info("custom migrations completed successfully")
	return nil
}
