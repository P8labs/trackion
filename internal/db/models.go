package db

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()"`
	AvatarUrl *string   `gorm:"column:avatar_url"`
	Email     string    `gorm:"column:email;unique"`
	Name      *string   `gorm:"column:name"`
	GithubID  *string   `gorm:"column:github_id;unique"`
	GoogleID  *string   `gorm:"column:google_id;unique"`
	CreatedAt time.Time `gorm:"column:created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at"`

	Subscription Subscription `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE"`
	Sessions     []Session    `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE"`
	Projects     []Project    `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE"`
}

func (User) TableName() string { return "users" }

type Subscription struct {
	ID                uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID            uuid.UUID `gorm:"column:user_id;type:uuid;not null;index"`
	Plan              string    `gorm:"column:plan;default:free"`
	Status            string    `gorm:"column:status;default:active"`
	MonthlyEventLimit int       `gorm:"column:monthly_event_limit;default:10000"`
	CurrentPeriodEnd  time.Time `gorm:"column:current_period_end"`
	CreatedAt         time.Time `gorm:"column:created_at"`
	UpdatedAt         time.Time `gorm:"column:updated_at"`

	User *User `gorm:"foreignKey:UserID;references:ID"`
}

func (Subscription) TableName() string { return "subscriptions" }

type Session struct {
	ID        uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID    uuid.UUID `gorm:"column:user_id;type:uuid;not null;index"`
	Token     string    `gorm:"column:token;uniqueIndex"`
	CreatedAt time.Time `gorm:"column:created_at"`
	ExpiresAt time.Time `gorm:"column:expires_at"`

	User *User `gorm:"foreignKey:UserID;references:ID"`
}

func (Session) TableName() string { return "sessions" }

type Project struct {
	ID         uuid.UUID      `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()"`
	Name       string         `gorm:"column:name;not null"`
	UserID     uuid.UUID      `gorm:"column:user_id;type:uuid;not null;index"`
	Status     string         `gorm:"column:status;default:active"`
	ApiKey     string         `gorm:"column:api_key;type:text;not null;uniqueIndex"`
	Properties datatypes.JSON `gorm:"column:properties;type:jsonb;not null;default:'{}'"`
	Domains    datatypes.JSON `gorm:"column:domains;type:jsonb;not null;default:'[]'"`
	CreatedAt  time.Time      `gorm:"column:created_at"`
	UpdatedAt  time.Time      `gorm:"column:updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"column:deleted_at;index"`

	Events []Event `gorm:"foreignKey:ProjectID;references:ID;constraint:OnDelete:CASCADE"`
	User   *User   `gorm:"foreignKey:UserID;references:ID"`
}

func (Project) TableName() string { return "projects" }

type Event struct {
	ID        int64     `gorm:"column:id;primaryKey;autoIncrement"`
	ProjectID uuid.UUID `gorm:"column:project_id;index:idx_project_time,priority:1;index:idx_project_event,priority:1"`

	EventName string `gorm:"column:event_name;index;index:idx_project_event,priority:2"`
	EventType string `gorm:"column:event_type;index"`

	UserID    *string `gorm:"column:user_id;index"`
	SessionID *string `gorm:"column:session_id;index"`

	Platform   *string `gorm:"column:platform;index"`
	Device     *string `gorm:"column:device"`
	OSVersion  *string `gorm:"column:os_version"`
	AppVersion *string `gorm:"column:app_version"`
	Browser    *string `gorm:"column:browser"`

	PagePath  *string `gorm:"column:page_path"`
	PageTitle *string `gorm:"column:page_title"`
	Referrer  *string `gorm:"column:referrer"`

	UTMSource   *string `gorm:"column:utm_source;index"`
	UTMMedium   *string `gorm:"column:utm_medium"`
	UTMCampaign *string `gorm:"column:utm_campaign"`

	Properties datatypes.JSON `gorm:"column:properties;type:jsonb;not null;default:'{}'"`

	CreatedAt time.Time `gorm:"column:created_at;index:idx_project_time,priority:2"`

	Project *Project `gorm:"foreignKey:ProjectID;references:ID"`
}

func (Event) TableName() string { return "events" }
