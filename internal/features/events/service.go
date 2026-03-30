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
	"trackion/internal/db"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventParams struct {
	ProjectKey string    `json:"project_key"`
	Event      string    `json:"event" validate:"required"`
	Type       string    `json:"type"`
	SessionID  string    `json:"session_Id" validate:"required"`
	UserAgent  string    `json:"user_agent"`
	ClientIP   string    `json:"-"`
	Timestamp  time.Time `json:"timestamp"`
	Page       struct {
		Title    string `json:"title"`
		Path     string `json:"path"`
		Referrer string `json:"referrer"`
	} `json:"page"`
	Utm struct {
		Source   string `json:"source"`
		Medium   string `json:"medium"`
		Campaign string `json:"campaign"`
	} `json:"utm"`
	Properties map[string]any `json:"properties"`
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
	GetMonthlyUsageByUser(ctx context.Context, userId uuid.UUID) (int64, error)
}

type svc struct {
	db          *gorm.DB
	cfg         config.Config
	geoResolver geoip.Resolver
}

var ErrMonthlyLimitReached = errors.New("monthly event limit reached for current subscription")

func NewService(db *gorm.DB, cfg config.Config) Service {
	return &svc{db: db, cfg: cfg, geoResolver: geoip.New(cfg)}
}

func (s *svc) CreateEvent(ctx context.Context, params EventParams) error {
	geo, err := s.geoResolver.Resolve(ctx, params.ClientIP)
	if err != nil {
		log.Printf("geo lookup failed for ip=%s: %v", params.ClientIP, err)
	}

	props, err := json.Marshal(mergeGeoProperties(params.Properties, geo))
	if err != nil {
		return err
	}

	projectId := ctx.Value(ProjectIdContextKey).(uuid.UUID)

	if s.cfg.IsSaaS() {
		if err := s.checkUsageLimit(ctx, projectId, 1); err != nil {
			return err
		}
	}

	deviceInfo := core.ResolveDeviceInfo(params.Properties, params.UserAgent)

	err = gorm.G[db.Event](s.db).Create(ctx, &db.Event{
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
	})

	if err != nil {
		return err
	}
	return nil

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

	if s.cfg.IsSaaS() {
		if err := s.checkUsageLimit(ctx, projectId, len(params.Events)); err != nil {
			return err
		}
	}

	events, err := ToInsertEvents(projectId, params.Events, geo)

	if err != nil {
		return err
	}

	err = gorm.G[db.Event](s.db).CreateInBatches(ctx, &events, len(events))

	if err != nil {
		return err

	}
	return nil

}

func (s *svc) checkUsageLimit(ctx context.Context, projectID uuid.UUID, incoming int) error {
	if incoming <= 0 {
		return nil
	}
	var userId uuid.UUID
	if err := s.db.Model(&db.Project{}).
		Select("user_id").
		Where("id = ?", projectID).
		Scan(&userId).Error; err != nil {
		return err
	}

	var limit int
	if err := s.db.Model(&db.Subscription{}).
		Select("monthly_event_limit").
		Where("user_id = ?", userId).
		Where("status = ?", "active").
		Order("created_at DESC").
		Limit(1).
		Scan(&limit).Error; err != nil {
		return err
	}

	if limit == 0 {
		return errors.New("no active subscription found")
	}

	usage, err := s.GetMonthlyUsageByUser(ctx, projectID)
	if err != nil {
		return errors.New("unable to verify usage limit")
	}

	if usage+int64(incoming) > int64(limit) {
		return ErrMonthlyLimitReached
	}

	return nil
}

func (s *svc) GetMonthlyUsageByUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	var count int64

	err := s.db.WithContext(ctx).
		Table("events AS e").
		Joins("JOIN projects p ON p.id = e.project_id").
		Where("p.user_id = ?", userID).
		Where("e.created_at >= date_trunc('month', now())").
		Count(&count).Error

	if err != nil {
		return 0, err
	}

	return count, nil
}

func (s *svc) GetProjectConfig(ctx context.Context, projectId string) (ProjectConfig, error) {
	p, err := gorm.G[db.Project](s.db).
		Select("properties").
		Where("id = ?", projectId).
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
	props, err := json.Marshal(mergeGeoProperties(e.Properties, geo))
	deviceInfo := core.ResolveDeviceInfo(e.Properties, e.UserAgent)
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
	}, nil
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
	// TrackClicks default is false → leave as-is
}
