package models

import (
	"time"

	"github.com/google/uuid"
)

func (Subscription) TableName() string { return "subscriptions" }

type Subscription struct {
	ID                uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID            uuid.UUID `gorm:"column:user_id;type:uuid;not null;index" json:"user_id"`
	Plan              string    `gorm:"column:plan;default:free" json:"plan"`
	Status            string    `gorm:"column:status;default:active" json:"status"`
	MonthlyEventLimit int       `gorm:"column:monthly_event_limit;default:10000" json:"monthly_event_limit"`
	CurrentPeriodEnd  time.Time `gorm:"column:current_period_end" json:"current_period_end"`

	EventsUsedThisMonth int       `gorm:"column:events_used_this_month;default:0" json:"events_used_this_month"`
	ProjectsUsed        int       `gorm:"column:projects_used;default:0" json:"projects_used"`
	LastUsageReset      time.Time `gorm:"column:last_usage_reset;default:CURRENT_TIMESTAMP" json:"last_usage_reset"`

	MaxProjects        int  `gorm:"column:max_projects;default:3" json:"max_projects"`
	MaxConfigKeys      int  `gorm:"column:max_config_keys;default:10" json:"max_config_keys"` // -1 for unlimited
	ErrorRetentionDays int  `gorm:"column:error_retention_days;default:3" json:"error_retention_days"`
	SupportsRollout    bool `gorm:"column:supports_rollout;default:false" json:"supports_rollout"`

	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`

	User *User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
