package db

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	AvatarUrl *string   `gorm:"column:avatar_url" json:"avatar_url,omitempty"`
	Email     string    `gorm:"column:email;unique" json:"email"`
	Name      *string   `gorm:"column:name" json:"name,omitempty"`
	GithubID  *string   `gorm:"column:github_id;unique" json:"github_id,omitempty"`
	GoogleID  *string   `gorm:"column:google_id;unique" json:"google_id,omitempty"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`

	Subscription Subscription `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Sessions     []Session    `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Projects     []Project    `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}

func (User) TableName() string { return "users" }

type Subscription struct {
	ID                uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID            uuid.UUID `gorm:"column:user_id;type:uuid;not null;index" json:"user_id"`
	Plan              string    `gorm:"column:plan;default:free" json:"plan"`
	Status            string    `gorm:"column:status;default:active" json:"status"`
	MonthlyEventLimit int       `gorm:"column:monthly_event_limit;default:10000" json:"monthly_event_limit"`
	CurrentPeriodEnd  time.Time `gorm:"column:current_period_end" json:"current_period_end"`
	CreatedAt         time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt         time.Time `gorm:"column:updated_at" json:"updated_at"`

	User *User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}

func (Subscription) TableName() string { return "subscriptions" }

type Session struct {
	ID        uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"column:user_id;type:uuid;not null;index" json:"user_id"`
	Token     string    `gorm:"column:token;uniqueIndex" json:"token"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	ExpiresAt time.Time `gorm:"column:expires_at" json:"expires_at"`

	User *User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}

func (Session) TableName() string { return "sessions" }

type Project struct {
	ID         uuid.UUID      `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name       string         `gorm:"column:name;not null" json:"name"`
	UserID     uuid.UUID      `gorm:"column:user_id;type:uuid;not null;index" json:"user_id"`
	Status     string         `gorm:"column:status;default:active" json:"status"`
	ApiKey     string         `gorm:"column:api_key;type:text;not null;uniqueIndex" json:"api_key"`
	Properties datatypes.JSON `gorm:"column:properties;type:jsonb;not null;default:'{}'" json:"properties"`
	Domains    datatypes.JSON `gorm:"column:domains;type:jsonb;not null;default:'[]'" json:"domains"`
	CreatedAt  time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt  time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deleted_at,omitempty"`

	Events []Event `gorm:"foreignKey:ProjectID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	User   *User   `gorm:"foreignKey:UserID;references:ID" json:"-"`
}

func (Project) TableName() string { return "projects" }

type Event struct {
	ID        int64     `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	ProjectID uuid.UUID `gorm:"column:project_id;index:idx_project_time,priority:1;index:idx_project_event,priority:1" json:"project_id"`

	EventName string `gorm:"column:event_name;index;index:idx_project_event,priority:2" json:"event_name"`
	EventType string `gorm:"column:event_type;index" json:"event_type"`

	UserID    *string `gorm:"column:user_id;index" json:"user_id,omitempty"`
	SessionID *string `gorm:"column:session_id;index" json:"session_id,omitempty"`

	Platform   *string `gorm:"column:platform;index" json:"platform,omitempty"`
	Device     *string `gorm:"column:device" json:"device,omitempty"`
	OSVersion  *string `gorm:"column:os_version" json:"os_version,omitempty"`
	AppVersion *string `gorm:"column:app_version" json:"app_version,omitempty"`
	Browser    *string `gorm:"column:browser" json:"browser,omitempty"`

	PagePath  *string `gorm:"column:page_path" json:"page_path,omitempty"`
	PageTitle *string `gorm:"column:page_title" json:"page_title,omitempty"`
	Referrer  *string `gorm:"column:referrer" json:"referrer,omitempty"`

	UTMSource   *string `gorm:"column:utm_source;index" json:"utm_source,omitempty"`
	UTMMedium   *string `gorm:"column:utm_medium" json:"utm_medium,omitempty"`
	UTMCampaign *string `gorm:"column:utm_campaign" json:"utm_campaign,omitempty"`

	Properties datatypes.JSON `gorm:"column:properties;type:jsonb;not null;default:'{}'" json:"properties"`

	CreatedAt time.Time `gorm:"column:created_at;index:idx_project_time,priority:2" json:"created_at"`

	Project *Project `gorm:"foreignKey:ProjectID;references:ID" json:"-"`
}

func (Event) TableName() string { return "events" }
