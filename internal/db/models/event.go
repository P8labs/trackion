package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

func (Event) TableName() string { return "events" }

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
