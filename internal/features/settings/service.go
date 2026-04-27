package settings

import (
	"context"
	"errors"
	"trackion/internal/config"
	db "trackion/internal/db/models"
	"trackion/internal/features/auth"
	"trackion/internal/repo"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UsageSummary struct {
	Mode            string `json:"mode"`
	IsLimited       bool   `json:"is_limited"`
	Plan            string `json:"plan,omitempty"`
	Status          string `json:"status,omitempty"`
	CurrentUsage    int64  `json:"current_usage"`
	MonthlyLimit    int64  `json:"monthly_limit"`
	Remaining       int64  `json:"remaining"`
	RetentionDays   int    `json:"retention_days"`
	DeleteAfterDays int    `json:"delete_after_days"`
}

type Service interface {
	GetUsageSummary(ctx context.Context) (UsageSummary, error)
}

type service struct {
	db  *gorm.DB
	cfg config.Config
}

func NewService(db *gorm.DB, cfg config.Config) Service {
	return &service{db: db, cfg: cfg}
}

func (s *service) GetUsageSummary(ctx context.Context) (UsageSummary, error) {
	if s.cfg.IsSelfHost() {
		return UsageSummary{
			Mode:            string(config.ModeSelfHost),
			IsLimited:       false,
			CurrentUsage:    0,
			MonthlyLimit:    0,
			Remaining:       0,
			RetentionDays:   s.cfg.EventRetentionDays,
			DeleteAfterDays: s.cfg.ProjectDeleteAfter,
		}, nil
	}

	userIDRaw, ok := ctx.Value(auth.UserIdContextKey).(string)
	if !ok || userIDRaw == "" {
		return UsageSummary{}, errors.New("unauthorized")
	}

	userID, err := uuid.Parse(userIDRaw)
	if err != nil {
		return UsageSummary{}, errors.New("invalid user id")
	}

	subscription, err := gorm.G[db.Subscription](s.db).
		Where(repo.Subscription.UserID.Eq(userID)).
		Where(repo.Subscription.Status.Eq("active")).
		First(ctx)
	if err != nil {
		return UsageSummary{}, errors.New("active subscription not found")
	}

	usage, err := s.GetMonthlyUsageByUser(ctx, userID)
	if err != nil {
		return UsageSummary{}, errors.New("unable to read usage")
	}

	remaining := max(int64(subscription.MonthlyEventLimit)-usage, 0)

	return UsageSummary{
		Mode:            string(config.ModeSaaS),
		IsLimited:       true,
		Plan:            subscription.Plan,
		Status:          subscription.Status,
		CurrentUsage:    usage,
		MonthlyLimit:    int64(subscription.MonthlyEventLimit),
		Remaining:       remaining,
		RetentionDays:   s.cfg.EventRetentionDays,
		DeleteAfterDays: s.cfg.ProjectDeleteAfter,
	}, nil
}

func (s *service) GetMonthlyUsageByUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	var count int64

	err := s.db.WithContext(ctx).
		Table("events AS e").
		Joins("JOIN projects p ON p.id = e.project_id").
		Where("p.user_id = ?", userID).
		Where("e.created_at >= date_trunc('month', now())").
		Count(&count).Error

	if err != nil {
		return 0, err
	}

	return count, nil
}
