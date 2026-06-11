package billing

import (
	"context"
	"encoding/json"
	"errors"
	"time"
	"trackion/internal/config"
	db "trackion/internal/db/models"
	"trackion/internal/features/auth"
	"trackion/internal/static"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrPlanNotFound      = errors.New("subscription plan not found")
	ErrProjectLimitHit   = errors.New("project limit reached for current plan")
	ErrConfigLimitHit    = errors.New("config key limit reached for current plan")
	ErrRolloutNotAllowed = errors.New("rollout percentage not available on free plan")
)

type Service struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewService(db *gorm.DB, cfg *config.Config) *Service {
	return &Service{db: db, cfg: cfg}
}

func (s *Service) GetPlans(ctx context.Context) PlansResponse {

	var raw []byte
	switch s.cfg.Mode {
	case config.BETA:
		raw = static.PlanBetaJSON
	case config.PAID:
		raw = static.PlanPaidJSON
	case config.UNLIMITED:
		raw = static.PlanUnlimitedJSON
	default:
		raw = static.PlanBetaJSON
	}

	parsedPlans, err := ParsePlans(raw)
	if err != nil {
		// fallback to hardcoded plans if parsing fails
		return s.getHardcodedPlans()
	}

	return PlansResponse{
		Plans: parsedPlans,
	}

}

func (s *Service) SetupDefaultSubscription(ctx context.Context, userID string, plan string) error {

	planType, err := ParsePlan(plan)
	if err != nil {
		return err
	}

	isValid := false

	switch s.cfg.Mode {
	case config.BETA:
		isValid = (planType == FreePlan)
	case config.PAID:
		isValid = (planType == FreePlan || planType == ProPlan)
	case config.UNLIMITED:
		isValid = (planType == FreePlan || planType == UnlimitedPlan)
	}

	if !isValid {
		return ErrPlanNotFound
	}

	var subscription db.Subscription
	err = s.db.WithContext(ctx).
		Where("user_id = ? AND status = ?", uuid.MustParse(userID), "active").
		Order("created_at DESC").
		First(&subscription).Error

	if err == nil {
		return nil
	}

	p := NewPlanInfo(plan, "active")
	subscription = db.Subscription{
		UserID:             uuid.MustParse(userID),
		Status:             p.Status,
		Plan:               string(p.Plan),
		CurrentPeriodEnd:   p.CurrentPeriodEnd,
		MonthlyEventLimit:  p.Limits.MonthlyEvents,
		MaxProjects:        p.Limits.MaxProjects,
		MaxConfigKeys:      p.Limits.MaxConfigKeys,
		ErrorRetentionDays: p.Limits.ErrorRetention,
		SupportsRollout:    p.Limits.SupportsRollout,
	}

	return gorm.G[db.Subscription](s.db).Create(ctx, &subscription)
}

func (s *Service) GetUserPlan(ctx context.Context, userID uuid.UUID) (PlanInfo, error) {
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

func (s *Service) CheckProjectLimit(ctx context.Context, userID uuid.UUID) error {
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

func (s *Service) CheckConfigLimit(ctx context.Context, projectID uuid.UUID, currentCount int) error {
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

func (s *Service) CheckRolloutAllowed(ctx context.Context, userID uuid.UUID, rolloutPercentage int) error {
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

func (s *Service) GetErrorRetentionPeriod(ctx context.Context, userID uuid.UUID) (time.Duration, error) {
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

func (s *Service) CheckFeatureFlagRollout(ctx context.Context) error {
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

func (s *Service) IncrementEventUsage(ctx context.Context, userID uuid.UUID, count int) error {
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

// handles selfhost plan also...!
func (s *Service) CheckEventLimit(ctx context.Context, userID uuid.UUID, additionalEvents int) error {
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

	if subscription.Plan == string(UnlimitedPlan) {
		return nil
	}

	if subscription.EventsUsedThisMonth+additionalEvents > subscription.MonthlyEventLimit {
		return errors.New("monthly event limit reached for current plan")
	}

	return nil
}

func (s *Service) GetUsage(ctx context.Context, userID uuid.UUID) (*Usage, error) {
	var subscription db.Subscription
	err := s.db.WithContext(ctx).
		Select(
			"events_used_this_month",
			"projects_used",
			"monthly_event_limit",
			"max_projects",
			"max_config_keys",
			"error_retention_days",
			"supports_rollout",
			"plan",
			"status",
			"current_period_end",
			"last_usage_reset",
		).
		Where("user_id = ? AND status = 'active'", userID).
		First(&subscription).Error
	if err != nil {
		return nil, err
	}

	var configCount int64
	err = s.db.WithContext(ctx).
		Model(&db.Config{}).
		Joins("JOIN projects ON projects.id = configs.project_id").
		Where("projects.user_id = ? AND projects.deleted_at IS NULL", userID).
		Count(&configCount).Error
	if err != nil {
		return nil, err
	}

	var flagCount int64
	err = s.db.WithContext(ctx).
		Model(&db.Flag{}).
		Joins("JOIN projects ON projects.id = flags.project_id").
		Where("projects.user_id = ? AND projects.deleted_at IS NULL", userID).
		Count(&flagCount).Error
	if err != nil {
		return nil, err
	}

	eventsRemaining := max(subscription.MonthlyEventLimit-subscription.EventsUsedThisMonth, 0)
	projectsRemaining := max(subscription.MaxProjects-subscription.ProjectsUsed, 0)

	configUnlimited := subscription.MaxConfigKeys < 0
	configKeysRemaining := -1
	if !configUnlimited {
		configKeysRemaining = max(subscription.MaxConfigKeys-int(configCount), 0)
	}

	eventsUsedPercent := 0.0
	if subscription.MonthlyEventLimit > 0 {
		eventsUsedPercent = float64(subscription.EventsUsedThisMonth) / float64(subscription.MonthlyEventLimit) * 100
	}

	projectsUsedPercent := 0.0
	if subscription.MaxProjects > 0 {
		projectsUsedPercent = float64(subscription.ProjectsUsed) / float64(subscription.MaxProjects) * 100
	}

	configKeysUsedPercent := 0.0
	if !configUnlimited && subscription.MaxConfigKeys > 0 {
		configKeysUsedPercent = float64(configCount) / float64(subscription.MaxConfigKeys) * 100
	}

	return &Usage{
		Plan:                  subscription.Plan,
		Status:                subscription.Status,
		CurrentPeriodEnd:      subscription.CurrentPeriodEnd,
		LastUsageReset:        subscription.LastUsageReset,
		EventsUsed:            subscription.EventsUsedThisMonth,
		EventsLimit:           subscription.MonthlyEventLimit,
		EventsRemaining:       eventsRemaining,
		ProjectsUsed:          subscription.ProjectsUsed,
		ProjectsLimit:         subscription.MaxProjects,
		ProjectsRemaining:     projectsRemaining,
		ConfigsUsed:           int(configCount),
		ConfigKeysLimit:       subscription.MaxConfigKeys,
		ConfigKeysRemaining:   configKeysRemaining,
		ConfigUnlimited:       configUnlimited,
		FeatureFlagsUsed:      int(flagCount),
		ErrorRetentionDays:    subscription.ErrorRetentionDays,
		SupportsRollout:       subscription.SupportsRollout,
		EventsUsedPercent:     eventsUsedPercent,
		ProjectsUsedPercent:   projectsUsedPercent,
		ConfigKeysUsedPercent: configKeysUsedPercent,
	}, nil
}

// no checks in function for self host and saas
func (s *Service) IncrementProjectUsage(ctx context.Context, userID uuid.UUID) error {
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

// no checks in function for self host and saas
func (s *Service) DecrementProjectUsage(ctx context.Context, userID uuid.UUID) error {
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

// no need as of now.
func (s *Service) UpgradeSubscription(ctx context.Context, userID uuid.UUID) error {
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

func ParsePlans(raw []byte) ([]Plan, error) {
	var plans []Plan
	err := json.Unmarshal(raw, &plans)
	if err != nil {
		return nil, err
	}
	return plans, nil
}

func (s *Service) getHardcodedPlans() PlansResponse {
	plans := []Plan{
		{
			Type:        FreePlan,
			Limits:      GetPlanLimits(FreePlan),
			Href:        "#",
			Cta:         "Get Started",
			Message:     "Ideal for small projects and personal use. Get started with basic features and limited usage.",
			Description: "The Free Plan offers essential features for small projects and personal use. It includes a monthly event limit of 10,000, support for up to 3 projects, and basic error retention for 3 days. This plan is perfect for those who are just getting started and want to explore our platform without any cost.",
			Title:       "Free Plan",
			Price:       "$0/month",
			Features: []string{
				"10,000 monthly events",
				"Up to 3 projects",
				"10 config keys per project",
				"3 days error retention",
			},
		}}

	return PlansResponse{
		Plans: plans,
	}
}
