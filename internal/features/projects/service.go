package projects

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"trackion/internal/core/domain"
	"trackion/internal/db"
	"trackion/internal/features/auth"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
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

type UpdateProjectRequest struct {
	Name     *string          `json:"name"`
	Domains  *[]string        `json:"domains"`
	Settings *ProjectSettings `json:"settings"`
}

type ProjectSettings struct {
	AutoPageview   bool `json:"auto_pageview"`
	TrackTimeSpent bool `json:"time_spent"`
	TrackCampaign  bool `json:"campaign"`
	TrackClicks    bool `json:"clicks"`
}

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
	GetProject(ctx context.Context, projectId string) (db.Project, error)
	GetUserProjects(ctx context.Context) ([]db.Project, error)
	UpdateProject(ctx context.Context, projectId string, params UpdateProjectParams) error
	DeleteProject(ctx context.Context, projectId string) error
}

type svc struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) Service {
	return &svc{db: db}
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

	autoPageview := true
	trackTimeSpent := false
	trackCampaign := false
	trackClicks := false

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

	cfg := ProjectSettings{
		AutoPageview:   autoPageview,
		TrackTimeSpent: trackTimeSpent,
		TrackCampaign:  trackCampaign,
		TrackClicks:    trackClicks,
	}
	props, err := json.Marshal(cfg)
	if err != nil {
		return "", err
	}

	project := db.Project{
		Name:       name,
		UserID:     uuid.MustParse(userId),
		ApiKey:     apiKey,
		Status:     "active",
		Properties: props,
		Domains:    mustJSON(domains),
	}

	err = gorm.G[db.Project](s.db).Create(ctx, &project)

	if err != nil {
		return "", errors.New("Unable to create project. Try again")
	}

	return project.ID.String(), nil
}

func (s *svc) GetProject(ctx context.Context, projectId string) (db.Project, error) {
	project, err := gorm.G[db.Project](s.db).Where("id = ?", projectId).First(ctx)
	if err != nil {
		return db.Project{}, errors.New("Unable to get project. Not found")
	}
	return project, nil
}

func (s *svc) GetUserProjects(ctx context.Context) ([]db.Project, error) {
	userId := ctx.Value(auth.UserIdContextKey).(string)
	projects, err := gorm.G[db.Project](s.db).Where("user_id = ?", userId).Find(ctx)
	if err != nil {
		return nil, errors.New("Unable to fetch projects")
	}
	return projects, nil
}

func (s *svc) UpdateProject(ctx context.Context, projectId string, params UpdateProjectParams) error {
	project, err := gorm.G[db.Project](s.db).Where("id = ?", projectId).First(ctx)
	if err != nil {
		return errors.New("Project not found")
	}

	if params.Name != nil {
		name := strings.TrimSpace(*params.Name)
		if len(name) < 2 {
			return errors.New("project name must be at least 2 characters")
		}
		project.Name = name
	}

	if params.Domains != nil {
		normalizedDomains, err := domain.NormalizeDomains(*params.Domains)
		if err != nil {
			return errors.New("invalid domains list")
		}

		d, _ := json.Marshal(normalizedDomains)
		project.Domains = d
	}

	var cfg ProjectSettings
	if len(project.Properties) > 0 {
		_ = json.Unmarshal(project.Properties, &cfg)
	}

	if params.AutoPageview != nil {
		cfg.AutoPageview = *params.AutoPageview
	}
	if params.TrackTimeSpent != nil {
		cfg.TrackTimeSpent = *params.TrackTimeSpent
	}
	if params.TrackCampaign != nil {
		cfg.TrackCampaign = *params.TrackCampaign
	}
	if params.TrackClicks != nil {
		cfg.TrackClicks = *params.TrackClicks
	}
	props, err := json.Marshal(cfg)
	if err != nil {
		return err
	}
	project.Properties = props

	if _, err := gorm.G[db.Project](s.db).
		Where("id = ?", projectId).
		Updates(ctx, project); err != nil {
		return errors.New("unable to update project")
	}
	return nil
}

func (s *svc) DeleteProject(ctx context.Context, projectId string) error {
	_, err := gorm.G[db.Project](s.db).
		Where("id = ?", projectId).Delete(ctx)
	if err != nil {
		return errors.New("Unable to delete project")
	}
	return nil
}

func mustJSON(v any) datatypes.JSON {
	b, _ := json.Marshal(v)
	return b
}
