package db

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	AvatarURL datatypes.NullString
	Name      datatypes.NullString
	GithubID  datatypes.NullString `gorm:"unique"`
	GoogleID  datatypes.NullString `gorm:"unique"`
	CreatedAt time.Time
	UpdatedAt time.Time

	Subscription Subscription `gorm:"constraint:OnDelete:CASCADE;foreignKey:UserID;references:ID"`
	Sessions     []Session    `gorm:"constraint:OnDelete:CASCADE;foreignKey:UserID;references:ID"`
	Projects     []Project    `gorm:"constraint:OnDelete:CASCADE;foreignKey:UserID;references:ID"`
}

type Subscription struct {
	ID                uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID            uuid.UUID `gorm:"type:uuid;not null;index"`
	Plan              string    `gorm:"default:free"`
	Status            string    `gorm:"default:active"`
	MonthlyEventLimit int       `gorm:"default:10000"` // monthly event limit
	CurrentPeriodEnd  time.Time // current period end
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

type Session struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index"`
	Token     string    `gorm:"uniqueIndex"`
	CreatedAt time.Time
	ExpiresAt time.Time
}

type Project struct {
	ID         uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID     uuid.UUID      `gorm:"type:uuid;not null;index"`
	Status     string         `gorm:"default:active"`
	ApiKey     string         `gorm:"type:text;not null;uniqueIndex"`
	Properties datatypes.JSON `gorm:"type:jsonb;not null;default:'{}'"`
	Domains    datatypes.JSON `gorm:"type:jsonb;not null;default:'[]'"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
	Events     []Event        `gorm:"constraint:OnDelete:CASCADE;foreignKey:ProjectID;references:ID"`
	DeletedAt  gorm.DeletedAt `gorm:"index"`
}

type Event struct {
	ID        int64     `gorm:"primaryKey;autoIncrement"`
	ProjectID uuid.UUID `gorm:"index:idx_project_time,priority:1;index:idx_project_event,priority:1"`
	EventName string    `gorm:"index;index:idx_project_event,priority:2"`

	EventType string `gorm:"index"`

	UserID    datatypes.NullString `gorm:"index"`
	SessionID datatypes.NullString `gorm:"index"`

	Platform   datatypes.NullString `gorm:"index"`
	Device     datatypes.NullString
	OSVersion  datatypes.NullString
	AppVersion datatypes.NullString

	PagePath  datatypes.NullString
	PageTitle datatypes.NullString
	Referrer  datatypes.NullString

	UTMSource   datatypes.NullString `gorm:"index"`
	UTMMedium   datatypes.NullString
	UTMCampaign datatypes.NullString

	Properties datatypes.JSON `gorm:"type:jsonb;not null;default:'{}'"`
	CreatedAt  time.Time      `gorm:"index:idx_project_time,priority:2"`
}
