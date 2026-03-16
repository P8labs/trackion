package projects

import (
	"context"
	"errors"
	"trackion/internal/repository"

	"github.com/google/uuid"
)

type CreateProjectParams struct {
	Name string `json:"name" validate:"required"`
}

type Service interface {
	CreateProject(ctx context.Context, params CreateProjectParams) (string, error)
}

type svc struct {
	repo repository.Querier
}

func NewService(repo repository.Querier) Service {
	return &svc{repo: repo}
}

var (
	ErrFailedCreation = errors.New("Unable to record the event")
)

func (s *svc) CreateProject(ctx context.Context, params CreateProjectParams) (string, error) {

	id := uuid.New()
	apiKey := uuid.NewSHA1(id, id.NodeID()).String()

	project, err := s.repo.CreateProject(ctx, repository.CreateProjectParams{
		Name:   params.Name,
		ID:     id,
		ApiKey: apiKey,
	})

	if err != nil {
		return "", errors.New("Unable to create project. Try again")
	}

	return project.ID.String(), nil

}
