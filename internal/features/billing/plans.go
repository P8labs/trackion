package billing

import (
	db "trackion/internal/db/models"
)

type PlanType string

const (
	PlanTypeFree     PlanType = "free"
	PlanTypePro      PlanType = "pro"
	PlanTypeSelfhost PlanType = "selfhost"
)

type PlanLimits struct {
	MonthlyEvents   int  `json:"monthly_events"`
	MaxProjects     int  `json:"max_projects"`
	MaxConfigKeys   int  `json:"max_config_keys"`  // per project
	ErrorRetention  int  `json:"error_retention"`  // in days
	SupportsRollout bool `json:"supports_rollout"` // feature flag rollout %
}

func GetPlanLimits(plan PlanType) PlanLimits {
	switch plan {
	case PlanTypeFree:
		return PlanLimits{
			MonthlyEvents:   10000,
			MaxProjects:     3,
			MaxConfigKeys:   10,
			ErrorRetention:  3, // 3 days
			SupportsRollout: false,
		}
	case PlanTypePro:
		return PlanLimits{
			MonthlyEvents:   200000,
			MaxProjects:     5,
			MaxConfigKeys:   -1, // unlimited
			ErrorRetention:  14, // 14 days
			SupportsRollout: true,
		}
	case PlanTypeSelfhost:
		return PlanLimits{
			MonthlyEvents:   -1,
			MaxProjects:     -1,
			MaxConfigKeys:   -1, // unlimited
			ErrorRetention:  90, // 14 days
			SupportsRollout: true,
		}
	default:
		return GetPlanLimits(PlanTypeFree)
	}
}

func (l PlanLimits) IsUnlimitedConfigKeys() bool {
	return l.MaxConfigKeys == -1
}

type PlanInfo struct {
	Plan   PlanType   `json:"plan"`
	Status string     `json:"status"`
	Limits PlanLimits `json:"limits"`
}

func NewPlanInfoFromSubscription(subscription db.Subscription) PlanInfo {
	return PlanInfo{
		Plan:   PlanType(subscription.Plan),
		Status: subscription.Status,
		Limits: PlanLimits{
			MonthlyEvents:   subscription.MonthlyEventLimit,
			MaxProjects:     subscription.MaxProjects,
			MaxConfigKeys:   subscription.MaxConfigKeys,
			ErrorRetention:  subscription.ErrorRetentionDays,
			SupportsRollout: subscription.SupportsRollout,
		},
	}
}

func NewPlanInfo(plan string, status string) PlanInfo {
	planType := PlanType(plan)
	return PlanInfo{
		Plan:   planType,
		Status: status,
		Limits: GetPlanLimits(planType),
	}
}
