package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

func (Project) TableName() string { return "projects" }

type Project struct {
	ID         uuid.UUID      `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name       string         `gorm:"column:name;not null" json:"name"`
	UserID     uuid.UUID      `gorm:"column:user_id;type:uuid;not null;index" json:"user_id"`
	Status     string         `gorm:"column:status;default:active" json:"status"`
	ApiKey     string         `gorm:"column:api_key;type:text;not null;uniqueIndex" json:"api_key"`
	Properties datatypes.JSON `gorm:"column:properties;type:jsonb;not null;default:'{}'" json:"properties"`
	Domains    datatypes.JSON `gorm:"column:domains;type:jsonb;not null;default:'[]'" json:"domains"`

	EventRetentionDays int `gorm:"column:event_retention_days;default:30" json:"event_retention_days"`

	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deleted_at,omitempty"`

	Events  []Event  `gorm:"foreignKey:ProjectID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Flags   []Flag   `gorm:"foreignKey:ProjectID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Configs []Config `gorm:"foreignKey:ProjectID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	User    *User    `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
