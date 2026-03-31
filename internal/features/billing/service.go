package billing

import (
	"context"
	"errors"
	"time"
	"trackion/internal/db"
	"trackion/internal/features/auth"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrPlanNotFound      = errors.New("subscription plan not found")
	ErrProjectLimitHit   = errors.New("project limit reached for current plan")
	ErrConfigLimitHit    = errors.New("config key limit reached for current plan")
	ErrRolloutNotAllowed = errors.New("rollout percentage not available on free plan")
)

type Usage struct {
	EventsUsed    int    `json:"events_used"`
	EventsLimit   int    `json:"events_limit"`
	ProjectsUsed  int    `json:"projects_used"`
	ProjectsLimit int    `json:"projects_limit"`
	Plan          string `json:"plan"`
}

type Service interface {
	GetUserPlan(ctx context.Context, userID uuid.UUID) (PlanInfo, error)
	CheckProjectLimit(ctx context.Context, userID uuid.UUID) error
	CheckConfigLimit(ctx context.Context, projectID uuid.UUID, currentCount int) error
	CheckRolloutAllowed(ctx context.Context, userID uuid.UUID, rolloutPercentage int) error
	GetErrorRetentionPeriod(ctx context.Context, userID uuid.UUID) (time.Duration, error)
	CheckFeatureFlagRollout(ctx context.Context) error
	IncrementEventUsage(ctx context.Context, userID uuid.UUID, count int) error
	CheckEventLimit(ctx context.Context, userID uuid.UUID, additionalEvents int) error
	GetUsage(ctx context.Context, userID uuid.UUID) (*Usage, error)
	UpgradeSubscription(ctx context.Context, userID uuid.UUID) error
	IncrementProjectUsage(ctx context.Context, userID uuid.UUID) error
	DecrementProjectUsage(ctx context.Context, userID uuid.UUID) error
}

type service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) Service {
	return &service{db: db}
}

func (s *service) GetUserPlan(ctx context.Context, userID uuid.UUID) (PlanInfo, error) {
	var subscription db.Subscription
	err := s.db.WithContext(ctx).
		Where("user_id = ? AND status = ?", userID, "active").
		Order("created_at DESC").
		First(&subscription).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			subscription = db.Subscription{
				UserID:             userID,
				Plan:               "free",
				Status:             "active",
				MonthlyEventLimit:  10000,
				MaxProjects:        3,
				MaxConfigKeys:      10,
				ErrorRetentionDays: 3,
				SupportsRollout:    false,
				CurrentPeriodEnd:   time.Now().AddDate(0, 1, 0), // 1 month from now
			}
			if err := s.db.WithContext(ctx).Create(&subscription).Error; err != nil {
				return PlanInfo{}, err
			}
		} else {
			return PlanInfo{}, err
		}
	}

	return NewPlanInfoFromSubscription(subscription), nil
}

func (s *service) CheckProjectLimit(ctx context.Context, userID uuid.UUID) error {
	var subscription db.Subscription
	err := s.db.WithContext(ctx).
		Select("max_projects").
		Where("user_id = ? AND status = 'active'", userID).
		First(&subscription).Error
	if err != nil {
		return err
	}

	var projectCount int64
	err = s.db.WithContext(ctx).
		Model(&db.Project{}).
		Where("user_id = ?", userID).
		Count(&projectCount).Error
	if err != nil {
		return err
	}

	if int(projectCount) >= subscription.MaxProjects {
		return ErrProjectLimitHit
	}

	return nil
}

func (s *service) CheckConfigLimit(ctx context.Context, projectID uuid.UUID, currentCount int) error {
	var project db.Project
	err := s.db.WithContext(ctx).
		Select("user_id").
		Where("id = ?", projectID).
		First(&project).Error
	if err != nil {
		return err
	}

	var subscription db.Subscription
	err = s.db.WithContext(ctx).
		Select("max_config_keys").
		Where("user_id = ? AND status = 'active'", project.UserID).
		First(&subscription).Error
	if err != nil {
		return err
	}

	if subscription.MaxConfigKeys == -1 {
		return nil
	}

	if currentCount >= subscription.MaxConfigKeys {
		return ErrConfigLimitHit
	}

	return nil
}

func (s *service) CheckRolloutAllowed(ctx context.Context, userID uuid.UUID, rolloutPercentage int) error {
	if rolloutPercentage == 100 {
		return nil
	}

	var subscription db.Subscription
	err := s.db.WithContext(ctx).
		Select("supports_rollout").
		Where("user_id = ? AND status = 'active'", userID).
		First(&subscription).Error
	if err != nil {
		return err
	}

	if !subscription.SupportsRollout {
		return ErrRolloutNotAllowed
	}

	return nil
}

func (s *service) GetErrorRetentionPeriod(ctx context.Context, userID uuid.UUID) (time.Duration, error) {
	var subscription db.Subscription
	err := s.db.WithContext(ctx).
		Select("error_retention_days").
		Where("user_id = ? AND status = 'active'", userID).
		First(&subscription).Error
	if err != nil {
		return 0, err
	}

	return time.Duration(subscription.ErrorRetentionDays) * 24 * time.Hour, nil
}

func (s *service) CheckFeatureFlagRollout(ctx context.Context) error {
	userID := ctx.Value(auth.UserIdContextKey)
	if userID == nil {
		return errors.New("user not found in context")
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		return err
	}

	return s.CheckRolloutAllowed(ctx, userUUID, 50)
}

func (s *service) IncrementEventUsage(ctx context.Context, userID uuid.UUID, count int) error {
	if count <= 0 {
		return nil
	}

	result := s.db.WithContext(ctx).Model(&db.Subscription{}).
		Where("user_id = ? AND status = 'active'", userID).
		Update("events_used_this_month", gorm.Expr("events_used_this_month + ?", count))
	
	if result.Error != nil {
		return result.Error
	}
	
	if result.RowsAffected == 0 {
		return errors.New("no active subscription found for user")
	}
	
	return nil
}

func (s *service) CheckEventLimit(ctx context.Context, userID uuid.UUID, additionalEvents int) error {
	if additionalEvents <= 0 {
		return nil
	}

	var subscription db.Subscription
	err := s.db.WithContext(ctx).
		Select("events_used_this_month", "monthly_event_limit").
		Where("user_id = ? AND status = 'active'", userID).
		First(&subscription).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("no active subscription found")
		}
		return err
	}

	if subscription.EventsUsedThisMonth+additionalEvents > subscription.MonthlyEventLimit {
		return errors.New("monthly event limit reached for current plan")
	}

	return nil
}

func (s *service) GetUsage(ctx context.Context, userID uuid.UUID) (*Usage, error) {
	var subscription db.Subscription
	err := s.db.WithContext(ctx).
		Select("events_used_this_month", "projects_used", "monthly_event_limit", "max_projects", "plan").
		Where("user_id = ? AND status = 'active'", userID).
		First(&subscription).Error
	if err != nil {
		return nil, err
	}

	return &Usage{
		EventsUsed:    subscription.EventsUsedThisMonth,
		EventsLimit:   subscription.MonthlyEventLimit,
		ProjectsUsed:  subscription.ProjectsUsed,
		ProjectsLimit: subscription.MaxProjects,
		Plan:          subscription.Plan,
	}, nil
}

func (s *service) UpgradeSubscription(ctx context.Context, userID uuid.UUID) error {
	return s.db.WithContext(ctx).Model(&db.Subscription{}).
		Where("user_id = ? AND status = 'active'", userID).
		Updates(map[string]any{
			"plan":                 "pro",
			"monthly_event_limit":  200000,
			"max_projects":         5,
			"max_config_keys":      -1,
			"error_retention_days": 14,
			"supports_rollout":     true,
		}).Error
}

func (s *service) IncrementProjectUsage(ctx context.Context, userID uuid.UUID) error {
	result := s.db.WithContext(ctx).Model(&db.Subscription{}).
		Where("user_id = ? AND status = 'active'", userID).
		Update("projects_used", gorm.Expr("projects_used + 1"))
	
	if result.Error != nil {
		return result.Error
	}
	
	if result.RowsAffected == 0 {
		return errors.New("no active subscription found for user")
	}
	
	return nil
}

func (s *service) DecrementProjectUsage(ctx context.Context, userID uuid.UUID) error {
	result := s.db.WithContext(ctx).Model(&db.Subscription{}).
		Where("user_id = ? AND status = 'active'", userID).
		Update("projects_used", gorm.Expr("GREATEST(0, projects_used - 1)"))
	
	if result.Error != nil {
		return result.Error
	}
	
	if result.RowsAffected == 0 {
		return errors.New("no active subscription found for user")
	}
	
	return nil
}
