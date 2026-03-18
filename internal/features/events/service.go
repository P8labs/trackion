package events

import (
	"context"
	"encoding/json"
	"errors"
	"time"
	"trackion/internal/core"
	"trackion/internal/repository"

	"github.com/google/uuid"
)

type EventParams struct {
	Event     string    `json:"event" validate:"required"`
	SessionID string    `json:"sessionId" validate:"required"`
	Timestamp time.Time `json:"timestamp"`
	Page      struct {
		Title    string `json:"title"`
		Path     string `json:"path"`
		Referrer string `json:"referrer"`
	} `json:"page"`
	UserAgent string `json:"userAgent"`
	Utm       struct {
		Source   string `json:"source"`
		Medium   string `json:"medium"`
		Campaign string `json:"campaign"`
	} `json:"utm"`
	Properties map[string]any `json:"properties"`
}

type BatchEventsParams struct {
	Events []EventParams `json:"events" validate:"required"`
}

type ProjectConfig = repository.GetProjectConfigRow

type Service interface {
	CreateEvent(ctx context.Context, params EventParams) (int64, error)
	GetProjectConfig(ctx context.Context, projectKey string) (ProjectConfig, error)
	CreateBatchEvents(ctx context.Context, params BatchEventsParams) (int, error)
}

type svc struct {
	repo repository.Querier
}

func NewService(repo repository.Querier) Service {
	return &svc{repo: repo}
}

func (s *svc) CreateEvent(ctx context.Context, params EventParams) (int64, error) {
	props, err := json.Marshal(params.Properties)
	if err != nil {
		return 0, err
	}

	projectId := ctx.Value(ProjectIdContextKey).(uuid.UUID)

	id, err := s.repo.InsertEvent(ctx, repository.InsertEventParams{
		ProjectID:   projectId,
		EventName:   params.Event,
		UserAgent:   core.StrPtr(params.UserAgent),
		SessionID:   core.StrPtr(params.SessionID),
		PagePath:    core.StrPtr(params.Page.Path),
		PageTitle:   core.StrPtr(params.Page.Title),
		Referrer:    core.StrPtr(params.Page.Referrer),
		UtmSource:   core.StrPtr(params.Utm.Source),
		UtmMedium:   core.StrPtr(params.Utm.Medium),
		UtmCampaign: core.StrPtr(params.Utm.Campaign),
		Properties:  props,
	})

	if err != nil {
		return 0, err
	}
	return id, nil

}

func (s *svc) CreateBatchEvents(ctx context.Context, params BatchEventsParams) (int, error) {
	projectId := ctx.Value(ProjectIdContextKey).(uuid.UUID)
	events, err := ToInsertEvents(projectId, params.Events)

	if err != nil {
		return 0, err
	}

	err = s.repo.InsertEventsBatch(ctx, events).Close()

	if err != nil {
		return 0, nil

	}
	return len(events), nil

}

func (s *svc) GetProjectConfig(ctx context.Context, projectKey string) (ProjectConfig, error) {
	cfg, err := s.repo.GetProjectConfig(ctx, projectKey)
	if err != nil {
		return ProjectConfig{}, errors.New("Unable to get project config with this key")
	}
	return cfg, nil

}

func ToInsertEvents(projectID uuid.UUID, events []EventParams) ([]repository.InsertEventsBatchParams, error) {
	out := make([]repository.InsertEventsBatchParams, 0, len(events))

	for _, e := range events {
		p, err := ToInsertEvent(projectID, e)
		if err != nil {
			return nil, err
		}
		out = append(out, p)
	}

	return out, nil
}

func ToInsertEvent(projectID uuid.UUID, e EventParams) (repository.InsertEventsBatchParams, error) {
	props, err := json.Marshal(e.Properties)
	if err != nil {
		return repository.InsertEventsBatchParams{}, err
	}

	return repository.InsertEventsBatchParams{
		ProjectID:   projectID,
		EventName:   e.Event,
		SessionID:   core.StrPtr(e.SessionID),
		UserAgent:   core.StrPtr(e.UserAgent),
		PagePath:    core.StrPtr(e.Page.Path),
		PageTitle:   core.StrPtr(e.Page.Title),
		Referrer:    core.StrPtr(e.Page.Referrer),
		UtmSource:   core.StrPtr(e.Utm.Source),
		UtmMedium:   core.StrPtr(e.Utm.Medium),
		UtmCampaign: core.StrPtr(e.Utm.Campaign),
		Properties:  props,
	}, nil
}
