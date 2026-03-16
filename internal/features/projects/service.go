package projects

import (
	"context"
	"errors"
	"trackion/internal/features/auth"
	"trackion/internal/repository"

	"github.com/google/uuid"
)

type CreateProjectParams struct {
	Name string `json:"name" validate:"required"`
}

type Service interface {
	CreateProject(ctx context.Context, params CreateProjectParams) (string, error)
	GetProject(ctx context.Context, projectId string) (repository.Project, error)
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
	userId := ctx.Value(auth.UserIdContextKey).(string)

	project, err := s.repo.CreateProject(ctx, repository.CreateProjectParams{
		Name:    params.Name,
		ID:      id,
		OwnerID: uuid.MustParse(userId),
		ApiKey:  apiKey,
	})

	if err != nil {
		return "", errors.New("Unable to create project. Try again")
	}

	return project.ID.String(), nil

}

func (s *svc) GetProject(ctx context.Context, projectId string) (repository.Project, error) {
	project, err := s.repo.GetProjectByID(ctx, uuid.MustParse(projectId))
	if err != nil {
		return repository.Project{}, errors.New("Unable to get project. Not found")
	}
	return project, nil
}
