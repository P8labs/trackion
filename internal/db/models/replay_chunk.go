package models

import (
	"time"

	"github.com/google/uuid"
)

func (ReplayChunk) TableName() string { return "replay_chunks" }

type ReplayChunk struct {
	ID        int64     `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	SessionID string    `gorm:"column:session_id;type:text;not null;index:idx_replay_chunks_session_created,priority:1;index:idx_replay_chunks_project_session_created,priority:2" json:"session_id"`
	ProjectID uuid.UUID `gorm:"column:project_id;type:uuid;not null;index:idx_replay_chunks_project_session_created,priority:1" json:"project_id"`
	Data      []byte    `gorm:"column:data;type:bytea;not null" json:"-"`
	CreatedAt time.Time `gorm:"column:created_at;not null;index:idx_replay_chunks_session_created,priority:2;index:idx_replay_chunks_project_session_created,priority:3" json:"created_at"`

	Project *Project `gorm:"foreignKey:ProjectID;references:ID" json:"-"`
}
