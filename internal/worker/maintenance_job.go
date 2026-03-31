package worker

import (
	"context"
	"fmt"
	"log/slog"
	"time"
	"trackion/internal/config"
	"trackion/internal/db"

	"gorm.io/gorm"
)

type MaintenanceJob struct {
	db  *gorm.DB
	cfg config.Config
	log *slog.Logger
}

func NewMaintenanceJob(db *gorm.DB, cfg config.Config, logger *slog.Logger) *MaintenanceJob {
	if logger == nil {
		logger = slog.Default()
	}

	return &MaintenanceJob{db: db, cfg: cfg, log: logger}
}

func (j *MaintenanceJob) Name() string {
	return "maintenance.cleanup"
}

func (j *MaintenanceJob) Spec() string {
	return j.cfg.CleanupCronSpec
}

func (j *MaintenanceJob) Run(ctx context.Context) error {
	jobCtx, cancel := context.WithTimeout(ctx, time.Duration(j.cfg.CleanupTimeoutSec)*time.Second)
	defer cancel()

	renewedSubscriptions, resetUsage, err := j.renewFreeSubscriptions(jobCtx)
	if err != nil {
		return fmt.Errorf("renew free subscriptions: %w", err)
	}

	updatedProjectCounts, err := j.updateProjectCounts(jobCtx)
	if err != nil {
		return fmt.Errorf("update project counts: %w", err)
	}

	_, err = j.cleanupExpiredSessions(jobCtx)
	if err != nil {
		return fmt.Errorf("cleanup sessions: %w", err)
	}

	deletedEvents, err := j.deleteOldEventsByProject(jobCtx)
	if err != nil {
		return fmt.Errorf("cleanup events: %w", err)
	}

	projectCutoff := time.Now().AddDate(0, 0, -j.cfg.ProjectDeleteAfter)
	deletedProjects, err := j.hardDeleteProjects(jobCtx, projectCutoff)
	if err != nil {
		return fmt.Errorf("cleanup deleted projects: %w", err)
	}

	j.log.Info("maintenance cleanup summary",
		"renewed_subscriptions", renewedSubscriptions,
		"reset_usage_count", resetUsage,
		"updated_project_counts", updatedProjectCounts,
		"deleted_events", deletedEvents,
		"deleted_projects", deletedProjects,
		"project_cutoff", projectCutoff.Format(time.RFC3339),
	)

	return nil
}

func (j *MaintenanceJob) renewFreeSubscriptions(ctx context.Context) (int64, int64, error) {
	// Reset usage counts for subscriptions starting a new period
	resetUsageRes := j.db.WithContext(ctx).
		Model(&db.Subscription{}).
		Where("status = ?", "active").
		Where("current_period_end IS NULL OR current_period_end <= NOW()").
		Updates(map[string]interface{}{
			"current_period_end":     gorm.Expr("date_trunc('month', now()) + INTERVAL '1 month'"),
			"events_used_this_month": 0,
			"last_usage_reset":       gorm.Expr("NOW()"),
		})

	if resetUsageRes.Error != nil {
		return 0, 0, resetUsageRes.Error
	}

	return resetUsageRes.RowsAffected, resetUsageRes.RowsAffected, nil
}

func (j *MaintenanceJob) hardDeleteProjects(ctx context.Context, cutoff time.Time) (int64, error) {
	res := j.db.WithContext(ctx).
		Unscoped().
		Where("deleted_at IS NOT NULL").
		Where("deleted_at < ?", cutoff).
		Delete(&db.Project{})

	if res.Error != nil {
		return 0, res.Error
	}

	return res.RowsAffected, nil
}

func (j *MaintenanceJob) updateProjectCounts(ctx context.Context) (int64, error) {
	query := `
		UPDATE subscriptions 
		SET projects_used = (
			SELECT COUNT(*) 
			FROM projects 
			WHERE projects.user_id = subscriptions.user_id 
			AND projects.deleted_at IS NULL
		)
		WHERE status = 'active'
	`

	res := j.db.WithContext(ctx).Exec(query)
	if res.Error != nil {
		return 0, res.Error
	}

	return res.RowsAffected, nil
}

func (j *MaintenanceJob) deleteOldEventsByProject(ctx context.Context) (int64, error) {
	query := `
		DELETE FROM events 
		WHERE id IN (
			SELECT e.id 
			FROM events e
			JOIN projects p ON e.project_id = p.id
			WHERE e.created_at < (NOW() - INTERVAL '1 day' * p.event_retention_days)
		)
	`

	res := j.db.WithContext(ctx).Exec(query)
	if res.Error != nil {
		return 0, res.Error
	}

	return res.RowsAffected, nil
}

func (j *MaintenanceJob) deleteOldEvents(ctx context.Context, cutoff time.Time) (int64, error) {
	res := j.db.WithContext(ctx).
		Where("created_at < ?", cutoff).
		Delete(&db.Event{})

	if res.Error != nil {
		return 0, res.Error
	}

	return res.RowsAffected, nil
}

func (j *MaintenanceJob) cleanupExpiredSessions(ctx context.Context) (int64, error) {
	res := j.db.WithContext(ctx).
		Where("expires_at <= ?", time.Now()).
		Delete(&db.Session{})

	if res.Error != nil {
		return 0, res.Error
	}

	return res.RowsAffected, nil
}
