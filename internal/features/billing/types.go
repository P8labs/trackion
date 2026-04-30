package billing

import "time"

type Usage struct {
	Plan                string    `json:"plan"`
	Status              string    `json:"status"`
	CurrentPeriodEnd    time.Time `json:"current_period_end"`
	LastUsageReset      time.Time `json:"last_usage_reset"`
	EventsUsed          int       `json:"events_used"`
	EventsLimit         int       `json:"events_limit"`
	EventsRemaining     int       `json:"events_remaining"`
	ProjectsUsed        int       `json:"projects_used"`
	ProjectsLimit       int       `json:"projects_limit"`
	ProjectsRemaining   int       `json:"projects_remaining"`
	ConfigsUsed         int       `json:"configs_used"`
	ConfigKeysLimit     int       `json:"config_keys_limit"`
	ConfigKeysRemaining int       `json:"config_keys_remaining"`
	ConfigUnlimited     bool      `json:"config_unlimited"`
	FeatureFlagsUsed    int       `json:"feature_flags_used"`
	ErrorRetentionDays  int       `json:"error_retention_days"`
	SupportsRollout     bool      `json:"supports_rollout"`

	// percentages for frontend display
	EventsUsedPercent     float64 `json:"events_used_percent"`
	ProjectsUsedPercent   float64 `json:"projects_used_percent"`
	ConfigKeysUsedPercent float64 `json:"config_keys_used_percent"`
}
