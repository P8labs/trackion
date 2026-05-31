package projects

import "time"

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
