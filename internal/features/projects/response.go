package projects

import (
	"encoding/json"
	db "trackion/internal/db/models"

	"gorm.io/datatypes"
)

func ToProjectResponse(p db.Project) ProjectResponse {

	updatedAt := p.CreatedAt
	if !p.UpdatedAt.IsZero() {
		updatedAt = p.UpdatedAt
	}

	var cfg ProjectSettings
	if len(p.Properties) > 0 {
		_ = json.Unmarshal(p.Properties, &cfg)
	}

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
