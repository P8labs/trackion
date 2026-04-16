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

	EventRetentionDays int `gorm:"column:event_retention_days;default:30" json:"event_retention_days"`

	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deleted_at,omitempty"`

	Events  []Event  `gorm:"foreignKey:ProjectID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Flags   []Flag   `gorm:"foreignKey:ProjectID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Configs []Config `gorm:"foreignKey:ProjectID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	User    *User    `gorm:"foreignKey:UserID;references:ID" json:"-"`
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

type ReplaySession struct {
	SessionID  string    `gorm:"column:session_id;type:text;primaryKey" json:"session_id"`
	ProjectID  uuid.UUID `gorm:"column:project_id;type:uuid;not null;index:idx_replay_sessions_project_last_seen,priority:1" json:"project_id"`
	StartedAt  time.Time `gorm:"column:started_at;not null" json:"started_at"`
	LastSeenAt time.Time `gorm:"column:last_seen_at;not null;index:idx_replay_sessions_project_last_seen,priority:2,sort:desc" json:"last_seen_at"`

	Project *Project `gorm:"foreignKey:ProjectID;references:ID" json:"-"`
}

func (ReplaySession) TableName() string { return "replay_sessions" }

type ReplayChunk struct {
	ID        int64     `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	SessionID string    `gorm:"column:session_id;type:text;not null;index:idx_replay_chunks_session_created,priority:1;index:idx_replay_chunks_project_session_created,priority:2" json:"session_id"`
	ProjectID uuid.UUID `gorm:"column:project_id;type:uuid;not null;index:idx_replay_chunks_project_session_created,priority:1" json:"project_id"`
	Data      []byte    `gorm:"column:data;type:bytea;not null" json:"-"`
	CreatedAt time.Time `gorm:"column:created_at;not null;index:idx_replay_chunks_session_created,priority:2;index:idx_replay_chunks_project_session_created,priority:3" json:"created_at"`

	Project *Project `gorm:"foreignKey:ProjectID;references:ID" json:"-"`
}

func (ReplayChunk) TableName() string { return "replay_chunks" }

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

func (Flag) TableName() string { return "flags" }

type Config struct {
	ID        uuid.UUID      `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProjectID uuid.UUID      `gorm:"column:project_id;type:uuid;not null;index" json:"project_id"`
	Key       string         `gorm:"column:key;not null" json:"key"`
	Value     datatypes.JSON `gorm:"column:value;type:jsonb;not null;default:'{}'" json:"value"`
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`

	Project *Project `gorm:"foreignKey:ProjectID;references:ID" json:"-"`
}

func (Config) TableName() string { return "configs" }
