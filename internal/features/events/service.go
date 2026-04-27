package events

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"time"
	"trackion/internal/config"
	"trackion/internal/core"
	"trackion/internal/core/geoip"
	db "trackion/internal/db/models"
	"trackion/internal/features/billing"
	"trackion/internal/repo"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

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

type Service interface {
	CreateEvent(ctx context.Context, params EventParams) error
	GetProjectConfig(ctx context.Context, projectId string) (ProjectConfig, error)
	CreateBatchEvents(ctx context.Context, params BatchEventsParams) error
}

type svc struct {
	db          *gorm.DB
	cfg         config.Config
	geoResolver geoip.Resolver
	billing     billing.Service
}

var ErrMonthlyLimitReached = errors.New("monthly event limit reached for current subscription")

func NewService(db *gorm.DB, cfg config.Config) Service {
	return &svc{
		db:          db,
		cfg:         cfg,
		geoResolver: geoip.New(cfg),
		billing:     billing.NewService(db),
	}
}

func (s *svc) CreateEvent(ctx context.Context, params EventParams) error {
	geo, err := s.geoResolver.Resolve(ctx, params.ClientIP)
	if err != nil {
		log.Printf("geo lookup failed for ip=%s: %v", params.ClientIP, err)
	}

	cleanedProps := make(map[string]any)
	for k, v := range params.Properties {
		switch k {
		case "device", "platform", "browser", "user_agent", "device_type":
			continue
		default:
			cleanedProps[k] = v
		}
	}

	props, err := json.Marshal(mergeGeoProperties(cleanedProps, geo))
	if err != nil {
		return err
	}

	projectId := ctx.Value(ProjectIdContextKey).(uuid.UUID)

	var project db.Project
	project, err = gorm.G[db.Project](s.db).
		Select("user_id").
		Where(repo.Project.ID.Eq(projectId)).
		First(ctx)
	if err != nil {
		return err
	}

	if s.cfg.IsSaaS() {
		if err := s.billing.CheckEventLimit(ctx, project.UserID, 1); err != nil {
			return ErrMonthlyLimitReached
		}
	}

	deviceInfo := resolveEventDeviceInfo(params)

	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&db.Event{
			ProjectID:   projectId,
			EventName:   params.Event,
			EventType:   params.Type,
			SessionID:   core.StrPtr(params.SessionID),
			PagePath:    core.StrPtr(params.Page.Path),
			PageTitle:   core.StrPtr(params.Page.Title),
			Referrer:    core.StrPtr(params.Page.Referrer),
			UTMSource:   core.StrPtr(params.Utm.Source),
			UTMMedium:   core.StrPtr(params.Utm.Medium),
			UTMCampaign: core.StrPtr(params.Utm.Campaign),
			Properties:  props,
			Platform:    &deviceInfo.Platform,
			Device:      &deviceInfo.Device,
			OSVersion:   &deviceInfo.OS,
			AppVersion:  &deviceInfo.AppVersion,
			Browser:     &deviceInfo.Browser,
		}).Error; err != nil {
			return err
		}

		if s.cfg.IsSaaS() {
			if err := s.billing.IncrementEventUsage(ctx, project.UserID, 1); err != nil {
				log.Printf("Failed to increment event usage for user %s: %v", project.UserID, err)
				// Don't fail the request if usage tracking fails
			}
		}

		return nil
	})

	return err
}

func (s *svc) CreateBatchEvents(ctx context.Context, params BatchEventsParams) error {
	projectId := ctx.Value(ProjectIdContextKey).(uuid.UUID)

	var geo *geoip.Location
	var err error
	if len(params.Events) > 0 {
		geo, err = s.geoResolver.Resolve(ctx, params.Events[0].ClientIP)
		if err != nil {
			log.Printf("geo lookup failed for ip=%s: %v", params.Events[0].ClientIP, err)
		}
	}

	eventCount := len(params.Events)
	if eventCount == 0 {
		return nil
	}

	var project db.Project
	project, err = gorm.G[db.Project](s.db).
		Select("user_id").
		Where(repo.Project.ID.Eq(projectId)).
		First(ctx)
	if err != nil {
		return err
	}

	if s.cfg.IsSaaS() {
		if err := s.billing.CheckEventLimit(ctx, project.UserID, eventCount); err != nil {
			return ErrMonthlyLimitReached
		}
	}

	events, err := ToInsertEvents(projectId, params.Events, geo)
	if err != nil {
		return err
	}

	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.CreateInBatches(&events, len(events)).Error; err != nil {
			return err
		}

		if s.cfg.IsSaaS() {
			if err := s.billing.IncrementEventUsage(ctx, project.UserID, eventCount); err != nil {
				log.Printf("Failed to increment event usage for user %s: %v", project.UserID, err)
				// Don't fail the request if usage tracking fails
			}
		}

		return nil
	})

	return err
}

func (s *svc) GetProjectConfig(ctx context.Context, projectId string) (ProjectConfig, error) {
	pid, err := uuid.Parse(projectId)
	if err != nil {
		return ProjectConfig{}, err
	}

	p, err := gorm.G[db.Project](s.db).
		Select("properties").
		Where(repo.Project.ID.Eq(pid)).
		First(ctx)

	if err != nil {
		return ProjectConfig{}, err
	}

	var cfg ProjectConfig

	if len(p.Properties) > 0 {
		if err := json.Unmarshal(p.Properties, &cfg); err != nil {
			return ProjectConfig{}, err
		}
	}

	applyDefaults(&cfg)
	return cfg, nil

}

func ToInsertEvents(projectID uuid.UUID, events []EventParams, geo *geoip.Location) ([]db.Event, error) {
	out := make([]db.Event, 0, len(events))

	for _, e := range events {
		p, err := ToInsertEvent(projectID, e, geo)
		if err != nil {
			return nil, err
		}
		out = append(out, p)
	}

	return out, nil
}

func ToInsertEvent(projectID uuid.UUID, e EventParams, geo *geoip.Location) (db.Event, error) {
	deviceInfo := resolveEventDeviceInfo(e)
	cleanedProps := make(map[string]any)
	for k, v := range e.Properties {
		switch k {
		case "device", "platform", "browser", "user_agent", "device_type":
			continue
		default:
			cleanedProps[k] = v
		}
	}

	props, err := json.Marshal(mergeGeoProperties(cleanedProps, geo))

	if err != nil {
		return db.Event{}, err
	}
	return db.Event{
		ProjectID:   projectID,
		EventName:   e.Event,
		EventType:   e.Type,
		SessionID:   core.StrPtr(e.SessionID),
		PagePath:    core.StrPtr(e.Page.Path),
		PageTitle:   core.StrPtr(e.Page.Title),
		Referrer:    core.StrPtr(e.Page.Referrer),
		UTMSource:   core.StrPtr(e.Utm.Source),
		UTMMedium:   core.StrPtr(e.Utm.Medium),
		UTMCampaign: core.StrPtr(e.Utm.Campaign),
		Properties:  props,
		Platform:    &deviceInfo.Platform,
		Device:      &deviceInfo.Device,
		OSVersion:   &deviceInfo.OS,
		AppVersion:  &deviceInfo.AppVersion,
		Browser:     &deviceInfo.Browser,
	}, nil
}

func resolveEventDeviceInfo(e EventParams) core.DeviceInfo {
	info := core.ResolveDeviceInfo(e.Properties, e.UserAgent)

	if e.Platform != nil && *e.Platform != "" && *e.Platform != "Unknown" {
		info.Platform = *e.Platform
	}
	if e.Device != nil && *e.Device != "" && *e.Device != "Unknown" {
		info.Device = *e.Device
	}
	if e.Browser != nil && *e.Browser != "" && *e.Browser != "Unknown" {
		info.Browser = *e.Browser
	}

	return info
}

func mergeGeoProperties(properties map[string]any, geo *geoip.Location) map[string]any {
	if properties == nil {
		properties = map[string]any{}
	}

	if geo == nil {
		return properties
	}

	properties["geo"] = map[string]any{
		"country":      geo.Country,
		"country_code": geo.CountryCode,
		"emoji":        geo.Emoji,
		"region":       geo.Region,
		"city":         geo.City,
		"latitude":     geo.Latitude,
		"longitude":    geo.Longitude,
	}

	return properties
}

func applyDefaults(cfg *ProjectConfig) {

	if !cfg.AutoPageview {
		cfg.AutoPageview = true
	}
	if !cfg.TrackTimeSpent {
		cfg.TrackTimeSpent = true
	}
	if !cfg.TrackCampaign {
		cfg.TrackCampaign = true
	}
}
