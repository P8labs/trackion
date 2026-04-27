package models

import (
	"time"

	"github.com/google/uuid"
)

func (ReplaySession) TableName() string { return "replay_sessions" }

type ReplaySession struct {
	SessionID  string    `gorm:"column:session_id;type:text;primaryKey" json:"session_id"`
	ProjectID  uuid.UUID `gorm:"column:project_id;type:uuid;not null;index:idx_replay_sessions_project_last_seen,priority:1" json:"project_id"`
	StartedAt  time.Time `gorm:"column:started_at;not null" json:"started_at"`
	LastSeenAt time.Time `gorm:"column:last_seen_at;not null;index:idx_replay_sessions_project_last_seen,priority:2,sort:desc" json:"last_seen_at"`

	Project *Project `gorm:"foreignKey:ProjectID;references:ID" json:"-"`
}
