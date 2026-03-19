package worker

import (
	"context"
	"fmt"
	"log/slog"
	"time"
	"trackion/internal/config"
	"trackion/internal/repository"

	"github.com/jackc/pgx/v5/pgtype"
)

type MaintenanceJob struct {
	repo repository.Querier
	cfg  config.Config
	log  *slog.Logger
}

func NewMaintenanceJob(repo repository.Querier, cfg config.Config, logger *slog.Logger) *MaintenanceJob {
	if logger == nil {
		logger = slog.Default()
	}

	return &MaintenanceJob{repo: repo, cfg: cfg, log: logger}
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

	renewedSubscriptions, err := j.repo.RenewFreeSubscriptionsForNewMonth(jobCtx)
	if err != nil {
		return fmt.Errorf("renew free subscriptions: %w", err)
	}

	if err := j.repo.CleanupExpiredSessions(jobCtx); err != nil {
		return fmt.Errorf("cleanup sessions: %w", err)
	}

	eventCutoff := time.Now().AddDate(0, 0, -j.cfg.EventRetentionDays)
	deletedEvents, err := j.repo.DeleteEventsOlderThan(jobCtx, eventCutoff)
	if err != nil {
		return fmt.Errorf("cleanup events: %w", err)
	}

	projectCutoff := time.Now().AddDate(0, 0, -j.cfg.ProjectDeleteAfter)
	deletedProjects, err := j.repo.HardDeleteProjectsDeletedBefore(jobCtx, pgtype.Timestamptz{
		Time:  projectCutoff,
		Valid: true,
	})
	if err != nil {
		return fmt.Errorf("cleanup deleted projects: %w", err)
	}

	j.log.Info("maintenance cleanup summary",
		"renewed_subscriptions", renewedSubscriptions,
		"deleted_events", deletedEvents,
		"deleted_projects", deletedProjects,
		"event_cutoff", eventCutoff.Format(time.RFC3339),
		"project_cutoff", projectCutoff.Format(time.RFC3339),
	)

	return nil
}
