package projects

import (
	"encoding/json"
	"time"
	db "trackion/internal/db/models"

	"gorm.io/datatypes"
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

func ToProjectResponse(p db.Project) ProjectResponse {
	updatedAt := p.CreatedAt
	if !p.UpdatedAt.IsZero() {
		updatedAt = p.UpdatedAt
	}

	var cfg ProjectSettings
	if len(p.Properties) > 0 {
		_ = json.Unmarshal(p.Properties, &cfg)
	}

	applyDefaults(&cfg)

	return ProjectResponse{
		ID:      p.ID.String(),
		Name:    p.Name,
		APIKey:  p.ApiKey,
		Domains: jsonToStringSlice(p.Domains),

		Settings: ProjectSettingsDTO{
			AutoPageview: cfg.AutoPageview,
			TimeSpent:    cfg.TrackTimeSpent,
			Campaign:     cfg.TrackCampaign,
			Clicks:       cfg.TrackClicks,
		},

		CreatedAt: p.CreatedAt,
		UpdatedAt: updatedAt,
	}
}

func ToProjectResponseList(projects []db.Project) []ProjectResponse {
	result := make([]ProjectResponse, len(projects))
	for i, p := range projects {
		result[i] = ToProjectResponse(p)
	}
	return result
}

func jsonToStringSlice(d datatypes.JSON) []string {
	var out []string
	_ = json.Unmarshal(d, &out)
	return out
}

func applyDefaults(cfg *ProjectSettings) {

	if !cfg.AutoPageview {
		cfg.AutoPageview = true
	}
	if !cfg.TrackTimeSpent {
		cfg.TrackTimeSpent = true
	}
	if !cfg.TrackCampaign {
		cfg.TrackCampaign = true
	}
	// TrackClicks default is false → leave as-is
}
