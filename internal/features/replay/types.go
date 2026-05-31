package replay

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type IngestRequest struct {
	ProjectID string          `json:"project_key"`
	SessionID string          `json:"session_id"`
	Events    json.RawMessage `json:"events"`
}

type IngestParams struct {
	ProjectID uuid.UUID
	SessionID string
	EventsRaw json.RawMessage
}

type SessionSummary struct {
	SessionID  string    `json:"session_id"`
	ProjectID  string    `json:"project_id"`
	StartedAt  time.Time `json:"started_at"`
	LastSeenAt time.Time `json:"last_seen_at"`
	ChunkCount int64     `json:"chunk_count"`
}
