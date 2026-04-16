package replay

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"io"
	"strings"
	"time"
	"trackion/internal/db"
	"trackion/internal/features/auth"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var ErrInvalidReplayPayload = errors.New("invalid replay payload")

const (
	maxSessionIDLen = 255
)

type Service interface {
	Ingest(ctx context.Context, params IngestParams) error
	ListSessions(ctx context.Context, projectID string, limit int) ([]SessionSummary, error)
	GetSessionEvents(ctx context.Context, projectID, sessionID string) ([]json.RawMessage, error)
	DeleteSession(ctx context.Context, projectID, sessionID string) error
}

type IngestParams struct {
	ProjectID uuid.UUID
	SessionID string
	Events    []json.RawMessage
}

type svc struct {
	db *gorm.DB
}

type SessionSummary struct {
	SessionID  string    `json:"session_id"`
	ProjectID  string    `json:"project_id"`
	StartedAt  time.Time `json:"started_at"`
	LastSeenAt time.Time `json:"last_seen_at"`
	ChunkCount int64     `json:"chunk_count"`
}

func NewService(db *gorm.DB) Service {
	return &svc{db: db}
}

func (s *svc) Ingest(ctx context.Context, params IngestParams) error {
	sessionID := strings.TrimSpace(params.SessionID)
	if params.ProjectID == uuid.Nil || sessionID == "" || len(sessionID) > maxSessionIDLen || len(params.Events) == 0 {
		return ErrInvalidReplayPayload
	}

	rawEvents, err := json.Marshal(params.Events)
	if err != nil {
		return err
	}

	compressed, err := gzipData(rawEvents)
	if err != nil {
		return err
	}

	now := time.Now().UTC()

	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		session := db.ReplaySession{
			SessionID:  sessionID,
			ProjectID:  params.ProjectID,
			StartedAt:  now,
			LastSeenAt: now,
		}
		result := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "session_id"}},
			DoUpdates: clause.Assignments(map[string]any{
				"last_seen_at": now,
			}),
			Where: clause.Where{Exprs: []clause.Expression{
				clause.Eq{Column: clause.Column{Table: "replay_sessions", Name: "project_id"}, Value: params.ProjectID},
			}},
		}).Create(&session)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return ErrInvalidReplayPayload
		}

		chunk := db.ReplayChunk{
			SessionID: sessionID,
			ProjectID: params.ProjectID,
			Data:      compressed,
			CreatedAt: now,
		}

		return tx.Create(&chunk).Error
	})
}

func (s *svc) ListSessions(ctx context.Context, projectID string, limit int) ([]SessionSummary, error) {
	projectUUID, err := s.ensureProjectAccess(ctx, projectID)
	if err != nil {
		return nil, err
	}

	if limit <= 0 || limit > 200 {
		limit = 50
	}

	type sessionRow struct {
		SessionID  string
		ProjectID  uuid.UUID
		StartedAt  time.Time
		LastSeenAt time.Time
		ChunkCount int64
	}

	rows := make([]sessionRow, 0)
	err = s.db.WithContext(ctx).
		Table("replay_sessions rs").
		Select(`
			rs.session_id,
			rs.project_id,
			rs.started_at,
			rs.last_seen_at,
			COALESCE(COUNT(rc.id), 0) AS chunk_count
		`).
		Joins("LEFT JOIN replay_chunks rc ON rc.session_id = rs.session_id AND rc.project_id = rs.project_id").
		Where("rs.project_id = ?", projectUUID).
		Group("rs.session_id, rs.project_id, rs.started_at, rs.last_seen_at").
		Order("rs.last_seen_at DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	out := make([]SessionSummary, 0, len(rows))
	for _, row := range rows {
		out = append(out, SessionSummary{
			SessionID:  row.SessionID,
			ProjectID:  row.ProjectID.String(),
			StartedAt:  row.StartedAt,
			LastSeenAt: row.LastSeenAt,
			ChunkCount: row.ChunkCount,
		})
	}

	return out, nil
}

func (s *svc) GetSessionEvents(ctx context.Context, projectID, sessionID string) ([]json.RawMessage, error) {
	projectUUID, err := s.ensureProjectAccess(ctx, projectID)
	if err != nil {
		return nil, err
	}

	sessionID = strings.TrimSpace(sessionID)
	if sessionID == "" || len(sessionID) > maxSessionIDLen {
		return nil, ErrInvalidReplayPayload
	}

	var session db.ReplaySession
	if err := s.db.WithContext(ctx).
		Where("session_id = ? AND project_id = ?", sessionID, projectUUID).
		First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("session not found")
		}
		return nil, err
	}

	var chunks []db.ReplayChunk
	if err := s.db.WithContext(ctx).
		Where("session_id = ? AND project_id = ?", sessionID, projectUUID).
		Order("created_at ASC, id ASC").
		Find(&chunks).Error; err != nil {
		return nil, err
	}

	out := make([]json.RawMessage, 0, len(chunks)*50)
	for _, chunk := range chunks {
		decoded, err := ungzipData(chunk.Data)
		if err != nil {
			return nil, err
		}

		events, err := decodeChunkEvents(decoded)
		if err != nil {
			return nil, err
		}

		out = append(out, events...)
	}

	return out, nil
}

func (s *svc) DeleteSession(ctx context.Context, projectID, sessionID string) error {
	projectUUID, err := s.ensureProjectAccess(ctx, projectID)
	if err != nil {
		return err
	}

	sessionID = strings.TrimSpace(sessionID)
	if sessionID == "" || len(sessionID) > maxSessionIDLen {
		return ErrInvalidReplayPayload
	}

	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("session_id = ? AND project_id = ?", sessionID, projectUUID).Delete(&db.ReplayChunk{}).Error; err != nil {
			return err
		}

		res := tx.Where("session_id = ? AND project_id = ?", sessionID, projectUUID).Delete(&db.ReplaySession{})
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return errors.New("session not found")
		}

		return nil
	})
}

func (s *svc) ensureProjectAccess(ctx context.Context, projectID string) (uuid.UUID, error) {
	projectID = strings.TrimSpace(projectID)
	projectUUID, err := uuid.Parse(projectID)
	if err != nil {
		return uuid.Nil, errors.New("invalid project id")
	}

	userIDRaw, ok := ctx.Value(auth.UserIdContextKey).(string)
	if !ok || strings.TrimSpace(userIDRaw) == "" {
		return uuid.Nil, errors.New("unauthorized")
	}

	if userIDRaw == auth.SystemUserID {
		_, err := gorm.G[db.Project](s.db).
			Select("id").
			Where("id = ?", projectUUID).
			First(ctx)
		if err != nil {
			return uuid.Nil, errors.New("project not found")
		}
		return projectUUID, nil
	}

	userUUID, err := uuid.Parse(userIDRaw)
	if err != nil {
		return uuid.Nil, errors.New("invalid user id")
	}

	_, err = gorm.G[db.Project](s.db).
		Select("id").
		Where("id = ? AND user_id = ?", projectUUID, userUUID).
		First(ctx)
	if err != nil {
		return uuid.Nil, errors.New("project not found")
	}

	return projectUUID, nil
}

func gzipData(data []byte) ([]byte, error) {
	var buf bytes.Buffer
	zw := gzip.NewWriter(&buf)
	if _, err := zw.Write(data); err != nil {
		_ = zw.Close()
		return nil, err
	}
	if err := zw.Close(); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func ungzipData(data []byte) ([]byte, error) {
	zr, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	defer zr.Close()

	out, err := io.ReadAll(zr)
	if err != nil {
		return nil, err
	}

	return out, nil
}

func decodeChunkEvents(decoded []byte) ([]json.RawMessage, error) {
	var events []json.RawMessage
	if err := json.Unmarshal(decoded, &events); err == nil {
		return events, nil
	}

	var wrapped struct {
		Events []json.RawMessage `json:"events"`
	}
	if err := json.Unmarshal(decoded, &wrapped); err == nil && len(wrapped.Events) > 0 {
		return wrapped.Events, nil
	}

	var generic []any
	if err := json.Unmarshal(decoded, &generic); err == nil {
		out := make([]json.RawMessage, 0, len(generic))
		for _, item := range generic {
			raw, err := json.Marshal(item)
			if err != nil {
				continue
			}
			out = append(out, json.RawMessage(raw))
		}
		if len(out) > 0 {
			return out, nil
		}
	}

	return nil, errors.New("invalid replay chunk format")
}
