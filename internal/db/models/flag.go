package models

import (
	"time"

	"github.com/google/uuid"
)

func (Flag) TableName() string { return "flags" }

type Flag struct {
	ID                uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProjectID         uuid.UUID `gorm:"column:project_id;type:uuid;not null;index" json:"project_id"`
	Key               string    `gorm:"column:key;not null" json:"key"`
	Enabled           bool      `gorm:"column:enabled;default:false" json:"enabled"`
	RolloutPercentage int       `gorm:"column:rollout_percentage;default:100" json:"rollout_percentage"`
	CreatedAt         time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt         time.Time `gorm:"column:updated_at" json:"updated_at"`

	Project *Project `gorm:"foreignKey:ProjectID;references:ID" json:"-"`
}
