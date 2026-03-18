package projects

import (
	"time"
	"trackion/internal/repository"
)

type ProjectResponse struct {
	ID        string             `json:"id"`
	Name      string             `json:"name"`
	APIKey    string             `json:"api_key"`
	Domains   []string           `json:"domains"`
	Settings  ProjectSettingsDTO `json:"settings"`
	CreatedAt time.Time          `json:"created_at"`
	UpdatedAt time.Time          `json:"updated_at"`
}

type ProjectSettingsDTO struct {
	AutoPageview bool `json:"auto_pageview"`
	TimeSpent    bool `json:"time_spent"`
	Campaign     bool `json:"campaign"`
	Clicks       bool `json:"clicks"`
}

func ToProjectResponse(p repository.Project) ProjectResponse {
	return ProjectResponse{
		ID:      p.ID.String(),
		Name:    p.Name,
		APIKey:  p.ApiKey,
		Domains: []string{}, // TODO: Add domains tracking to database
		Settings: ProjectSettingsDTO{
			AutoPageview: p.AutoPageview,
			TimeSpent:    p.TrackTimeSpent,
			Campaign:     p.TrackCampaign,
			Clicks:       p.TrackClicks,
		},
		CreatedAt: p.CreatedAt,
		UpdatedAt: p.CreatedAt, // TODO: Add updated_at field to database
	}
}

func ToProjectResponseList(projects []repository.Project) []ProjectResponse {
	result := make([]ProjectResponse, len(projects))
	for i, p := range projects {
		result[i] = ToProjectResponse(p)
	}
	return result
}
