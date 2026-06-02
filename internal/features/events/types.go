package events

import "time"

type EventParams struct {
	ProjectKey string `json:"project_key"`
	Event      string `json:"event" validate:"required"`
	Type       string `json:"type,omitempty"`

	SessionID string  `json:"session_id" validate:"required"`
	UserID    *string `json:"user_id,omitempty"`

	UserAgent string `json:"user_agent"`
	ClientIP  string `json:"-"`

	Timestamp time.Time `json:"timestamp"`

	Device   *string `json:"device,omitempty"`
	Platform *string `json:"platform,omitempty"`
	Browser  *string `json:"browser,omitempty"`

	Page struct {
		Title    string `json:"title"`
		Path     string `json:"path"`
		Referrer string `json:"referrer"`
	} `json:"page"`

	Utm struct {
		Source   string `json:"source,omitempty"`
		Medium   string `json:"medium,omitempty"`
		Campaign string `json:"campaign,omitempty"`
	} `json:"utm"`

	Properties map[string]any `json:"properties,omitempty"`
}

type BatchEventsParams struct {
	ProjectKey string        `json:"project_key" validate:"required"`
	Events     []EventParams `json:"events" validate:"required"`
}

type ProjectConfig struct {
	AutoPageview   bool `json:"auto_pageview"`
	TrackTimeSpent bool `json:"track_time_spent"`
	TrackCampaign  bool `json:"track_campaign"`
	TrackClicks    bool `json:"track_clicks"`
}
