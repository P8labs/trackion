package billing

import (
	"time"
	db "trackion/internal/db/models"
)

func GetPlanLimits(plan PlanType) PlanLimits {
	switch plan {
	case FreePlan:
		return PlanLimits{
			MonthlyEvents:   10000,
			MaxProjects:     3,
			MaxConfigKeys:   10,
			ErrorRetention:  3, // 3 days
			SupportsRollout: false,
		}
	case ProPlan:
		return PlanLimits{
			MonthlyEvents:   200000,
			MaxProjects:     5,
			MaxConfigKeys:   -1,
			ErrorRetention:  14, // 14 days
			SupportsRollout: true,
		}
	case UnlimitedPlan:
		return PlanLimits{
			MonthlyEvents:   -1,
			MaxProjects:     -1,
			MaxConfigKeys:   -1, // unlimited
			ErrorRetention:  90,
			SupportsRollout: true,
		}
	default:
		return GetPlanLimits(FreePlan)
	}
}

func (l PlanLimits) IsUnlimitedConfigKeys() bool {
	return l.MaxConfigKeys == -1
}

type PlanInfo struct {
	Plan             PlanType   `json:"plan"`
	Status           string     `json:"status"`
	Limits           PlanLimits `json:"limits"`
	CurrentPeriodEnd time.Time  `json:"current_period_end"`
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

	endTime := time.Now().AddDate(0, 1, 0)

	if planType == FreePlan {
		endTime = time.Now().AddDate(0, 1, 0)
	}

	if planType == ProPlan {
		endTime = time.Now().AddDate(0, 1, 0)
	}

	if planType == UnlimitedPlan {
		endTime = time.Now().AddDate(100, 0, 0)
	}

	return PlanInfo{
		Plan:             planType,
		Status:           status,
		CurrentPeriodEnd: endTime,
		Limits:           GetPlanLimits(planType),
	}
}

func ParsePlan(plan string) (PlanType, error) {
	switch plan {
	case "free":
		return FreePlan, nil
	case "pro":
		return ProPlan, nil
	case "unlimited":
		return UnlimitedPlan, nil
	default:
		return FreePlan, ErrPlanNotFound
	}
}
