package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

func (Config) TableName() string { return "configs" }

type Config struct {
	ID        uuid.UUID      `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProjectID uuid.UUID      `gorm:"column:project_id;type:uuid;not null;index" json:"project_id"`
	Key       string         `gorm:"column:key;not null" json:"key"`
	Value     datatypes.JSON `gorm:"column:value;type:jsonb;not null;default:'{}'" json:"value"`
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`

	Project *Project `gorm:"foreignKey:ProjectID;references:ID" json:"-"`
}
