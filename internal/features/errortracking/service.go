package errortracking

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service interface {
	ListGroupedErrors(ctx context.Context, req ErrorListRequest) ([]GroupedError, error)
	GetErrorOccurrences(ctx context.Context, req ErrorDetailRequest) ([]ErrorOccurrence, error)
	GetErrorCount(ctx context.Context, projectID string, timeRange string) (int64, error)
}

type svc struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) Service {
	return &svc{db: db}
}

func (s *svc) ListGroupedErrors(ctx context.Context, req ErrorListRequest) ([]GroupedError, error) {
	projectID, err := uuid.Parse(req.ProjectID)
	if err != nil {
		return nil, err
	}

	var startTime time.Time
	switch req.TimeRange {
	case "24h":
		startTime = time.Now().Add(-24 * time.Hour)
	case "7d":
		startTime = time.Now().Add(-7 * 24 * time.Hour)
	case "30d":
		startTime = time.Now().Add(-30 * 24 * time.Hour)
	default:
		startTime = time.Time{} // all time
	}

	if req.Limit == 0 {
		req.Limit = 100
	}

	type QueryResult struct {
		Fingerprint string    `gorm:"column:fingerprint"`
		Message     string    `gorm:"column:message"`
		Count       int64     `gorm:"column:count"`
		FirstSeen   time.Time `gorm:"column:first_seen"`
		LastSeen    time.Time `gorm:"column:last_seen"`
		LastURL     string    `gorm:"column:last_url"`
	}

	var results []QueryResult
	query := s.db.WithContext(ctx).
		Table("events").
		Select(`
			properties->>'fingerprint' as fingerprint,
			properties->>'error_message' as message,
			COUNT(*) as count,
			MIN(created_at) as first_seen,
			MAX(created_at) as last_seen,
			(ARRAY_AGG(properties->>'url' ORDER BY created_at DESC))[1] as last_url
		`).
		Where("project_id = ?", projectID).
		Where("event_type = ?", "error").
		Where("properties->>'fingerprint' IS NOT NULL")

	if !startTime.IsZero() {
		query = query.Where("created_at >= ?", startTime)
	}

	query = query.
		Group("properties->>'fingerprint', properties->>'error_message'").
		Order("last_seen DESC").
		Limit(req.Limit).
		Offset(req.Offset)

	if err := query.Scan(&results).Error; err != nil {
		return nil, err
	}

	groupedErrors := make([]GroupedError, len(results))
	for i, r := range results {
		groupedErrors[i] = GroupedError{
			Fingerprint: r.Fingerprint,
			Message:     r.Message,
			Count:       r.Count,
			FirstSeen:   r.FirstSeen,
			LastSeen:    r.LastSeen,
			LastURL:     r.LastURL,
		}
	}

	return groupedErrors, nil
}

func (s *svc) GetErrorOccurrences(ctx context.Context, req ErrorDetailRequest) ([]ErrorOccurrence, error) {
	projectID, err := uuid.Parse(req.ProjectID)
	if err != nil {
		return nil, err
	}

	if req.Limit == 0 {
		req.Limit = 50
	}

	type QueryResult struct {
		ID         int64     `gorm:"column:id"`
		Properties []byte    `gorm:"column:properties"`
		UserID     *string   `gorm:"column:user_id"`
		SessionID  *string   `gorm:"column:session_id"`
		Browser    *string   `gorm:"column:browser"`
		Platform   *string   `gorm:"column:platform"`
		CreatedAt  time.Time `gorm:"column:created_at"`
	}

	var results []QueryResult
	err = s.db.WithContext(ctx).
		Table("events").
		Select("id, properties, user_id, session_id, browser, platform, created_at").
		Where("project_id = ?", projectID).
		Where("event_type = ?", "error").
		Where("properties->>'fingerprint' = ?", req.Fingerprint).
		Order("created_at DESC").
		Limit(req.Limit).
		Offset(req.Offset).
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	occurrences := make([]ErrorOccurrence, 0, len(results))
	for _, r := range results {
		var metadata ErrorMetadata
		if err := json.Unmarshal(r.Properties, &metadata); err != nil {
			// Skip malformed entries
			continue
		}

		browser := chooseDeviceValue(r.Browser, metadata.Browser, "Unknown Browser")
		platform := chooseDeviceValue(r.Platform, metadata.Platform, "Unknown Platform")

		occurrence := ErrorOccurrence{
			ID:           r.ID,
			Timestamp:    r.CreatedAt,
			Message:      metadata.ErrorMessage,
			StackTrace:   metadata.StackTrace,
			URL:          metadata.URL,
			UserID:       r.UserID,
			SessionID:    r.SessionID,
			Browser:      &browser,
			Platform:     &platform,
			LineNumber:   metadata.LineNumber,
			ColumnNumber: metadata.ColumnNumber,
			Context:      metadata.Context,
		}
		occurrences = append(occurrences, occurrence)
	}

	return occurrences, nil
}

func chooseDeviceValue(columnValue *string, metadataValue string, fallback string) string {
	if columnValue != nil {
		trimmed := strings.TrimSpace(*columnValue)
		if trimmed != "" && !strings.EqualFold(trimmed, "unknown") {
			return trimmed
		}
	}

	meta := strings.TrimSpace(metadataValue)
	if meta != "" && !strings.EqualFold(meta, "unknown") {
		return meta
	}

	return fallback
}

func (s *svc) GetErrorCount(ctx context.Context, projectID string, timeRange string) (int64, error) {
	pid, err := uuid.Parse(projectID)
	if err != nil {
		return 0, err
	}

	var startTime time.Time
	switch timeRange {
	case "24h":
		startTime = time.Now().Add(-24 * time.Hour)
	case "7d":
		startTime = time.Now().Add(-7 * 24 * time.Hour)
	case "30d":
		startTime = time.Now().Add(-30 * 24 * time.Hour)
	default:
		startTime = time.Time{} // all time
	}

	var count int64
	query := s.db.WithContext(ctx).
		Table("events").
		Where("project_id = ?", pid).
		Where("event_type = ?", "error")

	if !startTime.IsZero() {
		query = query.Where("created_at >= ?", startTime)
	}

	if err := query.Count(&count).Error; err != nil {
		return 0, err
	}

	return count, nil
}
