package projects

import (
	"context"
	"errors"
	"strings"
	"trackion/internal/core/domain"
	"trackion/internal/features/auth"
	"trackion/internal/repository"

	"github.com/google/uuid"
)

type CreateProjectParams struct {
	Name     string                `json:"name" validate:"required"`
	Domains  []string              `json:"domains"`
	Settings CreateProjectSettings `json:"settings"`
}

type CreateProjectSettings struct {
	AutoPageview   *bool `json:"auto_pageview"`
	TrackTimeSpent *bool `json:"time_spent"`
	TrackCampaign  *bool `json:"campaign"`
	TrackClicks    *bool `json:"clicks"`
}

// UpdateProjectRequest represents the request body for updating a project
type UpdateProjectRequest struct {
	Name     *string          `json:"name"`
	Domains  *[]string        `json:"domains"`
	Settings *ProjectSettings `json:"settings"`
}

// ProjectSettings represents the feature settings for update requests
type ProjectSettings struct {
	AutoPageview   *bool `json:"auto_pageview"`
	TrackTimeSpent *bool `json:"time_spent"`
	TrackCampaign  *bool `json:"campaign"`
	TrackClicks    *bool `json:"clicks"`
}

// UpdateProjectParams represents internal service parameters
type UpdateProjectParams struct {
	Name           *string   `json:"name"`
	AutoPageview   *bool     `json:"auto_pageview"`
	TrackTimeSpent *bool     `json:"time_spent"`
	TrackCampaign  *bool     `json:"campaign"`
	TrackClicks    *bool     `json:"clicks"`
	Domains        *[]string `json:"domains"`
}

type Service interface {
	CreateProject(ctx context.Context, params CreateProjectParams) (string, error)
	GetProject(ctx context.Context, projectId string) (repository.Project, error)
	GetUserProjects(ctx context.Context) ([]repository.Project, error)
	UpdateProject(ctx context.Context, projectId string, params UpdateProjectParams) error
	DeleteProject(ctx context.Context, projectId string) error
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
	name := strings.TrimSpace(params.Name)
	if len(name) < 2 {
		return "", errors.New("project name must be at least 2 characters")
	}

	id := uuid.New()
	apiKey := uuid.NewSHA1(id, id.NodeID()).String()
	userId := ctx.Value(auth.UserIdContextKey).(string)

	autoPageview := true    // Default to true
	trackTimeSpent := false // Default to false
	trackCampaign := false  // Default to false
	trackClicks := false    // Default to false

	if params.Settings.AutoPageview != nil {
		autoPageview = *params.Settings.AutoPageview
	}
	if params.Settings.TrackTimeSpent != nil {
		trackTimeSpent = *params.Settings.TrackTimeSpent
	}
	if params.Settings.TrackCampaign != nil {
		trackCampaign = *params.Settings.TrackCampaign
	}
	if params.Settings.TrackClicks != nil {
		trackClicks = *params.Settings.TrackClicks
	}

	domains, err := domain.NormalizeDomains(params.Domains)
	if err != nil {
		return "", errors.New("invalid domains list")
	}

	project, err := s.repo.CreateProject(ctx, repository.CreateProjectParams{
		Name:           name,
		ID:             id,
		OwnerID:        uuid.MustParse(userId),
		ApiKey:         apiKey,
		AutoPageview:   autoPageview,
		TrackTimeSpent: trackTimeSpent,
		TrackCampaign:  trackCampaign,
		TrackClicks:    trackClicks,
		Domains:        domains,
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

func (s *svc) GetUserProjects(ctx context.Context) ([]repository.Project, error) {
	userId := ctx.Value(auth.UserIdContextKey).(string)
	projects, err := s.repo.GetUserProjects(ctx, uuid.MustParse(userId))
	if err != nil {
		return nil, errors.New("Unable to fetch projects")
	}
	return projects, nil
}

func (s *svc) UpdateProject(ctx context.Context, projectId string, params UpdateProjectParams) error {
	existingProject, err := s.repo.GetProjectByID(ctx, uuid.MustParse(projectId))
	if err != nil {
		return errors.New("Project not found")
	}

	updateParams := repository.UpdateProjectParams{
		ID:             uuid.MustParse(projectId),
		Name:           existingProject.Name,
		AutoPageview:   existingProject.AutoPageview,
		TrackTimeSpent: existingProject.TrackTimeSpent,
		TrackCampaign:  existingProject.TrackCampaign,
		TrackClicks:    existingProject.TrackClicks,
		Domains:        existingProject.Domains,
	}

	if params.Name != nil {
		name := strings.TrimSpace(*params.Name)
		if len(name) < 2 {
			return errors.New("project name must be at least 2 characters")
		}
		updateParams.Name = name
	}
	if params.AutoPageview != nil {
		updateParams.AutoPageview = *params.AutoPageview
	}
	if params.TrackTimeSpent != nil {
		updateParams.TrackTimeSpent = *params.TrackTimeSpent
	}
	if params.TrackCampaign != nil {
		updateParams.TrackCampaign = *params.TrackCampaign
	}
	if params.TrackClicks != nil {
		updateParams.TrackClicks = *params.TrackClicks
	}
	if params.Domains != nil {
		normalizedDomains, err := domain.NormalizeDomains(*params.Domains)
		if err != nil {
			return errors.New("invalid domains list")
		}
		updateParams.Domains = normalizedDomains
	}

	// Update the project with merged data
	err = s.repo.UpdateProject(ctx, updateParams)
	if err != nil {
		return errors.New("Unable to update project")
	}
	return nil
}

func (s *svc) DeleteProject(ctx context.Context, projectId string) error {
	err := s.repo.DeleteProject(ctx, uuid.MustParse(projectId))
	if err != nil {
		return errors.New("Unable to delete project")
	}
	return nil
}
