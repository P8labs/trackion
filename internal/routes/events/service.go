package events

import (
	"context"
	"encoding/json"
	"errors"
	"trackion/internal/repository"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type AddEventParams struct {
	ProjectID  uuid.UUID      `json:"projectId" validate:"required"`
	EventName  string         `json:"event" validate:"required"`
	SessionID  pgtype.Text    `json:"sessionId" validate:"required"`
	Properties map[string]any `json:"properties" validate:"required"`
}

type Service interface {
	CreateEvent(ctx context.Context, params AddEventParams) (int64, error)
}

type svc struct {
	repo repository.Querier
}

func NewService(repo repository.Querier) Service {
	return &svc{repo: repo}
}

func (s *svc) CreateEvent(ctx context.Context, params AddEventParams) (int64, error) {
	props, err := json.Marshal(params.Properties)
	if err != nil {
		return 0, err
	}

	_, err = s.repo.GetProjectByID(ctx, params.ProjectID)

	if err != nil {
		return 0, errors.New("Project not found with this id")
	}

	id, err := s.repo.InsertEvent(ctx, repository.InsertEventParams{
		ProjectID:  params.ProjectID,
		EventName:  params.EventName,
		SessionID:  params.SessionID,
		Properties: props,
	})

	if err != nil {
		return 0, err
	}
	return id, nil

}
