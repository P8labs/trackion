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
	"trackion/internal/repository"

	"github.com/google/uuid"
)

type EventParams struct {
	ProjectKey string    `json:"project_key"`
	Event      string    `json:"event" validate:"required"`
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

type ProjectConfig = repository.GetProjectConfigRow

type Service interface {
	CreateEvent(ctx context.Context, params EventParams) (int64, error)
	GetProjectConfig(ctx context.Context, projectId string) (ProjectConfig, error)
	CreateBatchEvents(ctx context.Context, params BatchEventsParams) (int, error)
}

type svc struct {
	repo        repository.Querier
	cfg         config.Config
	geoResolver geoip.Resolver
}

var ErrMonthlyLimitReached = errors.New("monthly event limit reached for current subscription")

func NewService(repo repository.Querier, cfg config.Config) Service {
	return &svc{repo: repo, cfg: cfg, geoResolver: geoip.New(cfg)}
}

func (s *svc) CreateEvent(ctx context.Context, params EventParams) (int64, error) {
	geo, err := s.geoResolver.Resolve(ctx, params.ClientIP)
	if err != nil {
		log.Printf("geo lookup failed for ip=%s: %v", params.ClientIP, err)
	}

	props, err := json.Marshal(mergeGeoProperties(params.Properties, geo))
	if err != nil {
		return 0, err
	}

	projectId := ctx.Value(ProjectIdContextKey).(uuid.UUID)

	if s.cfg.IsSaaS() {
		if err := s.checkUsageLimit(ctx, projectId, 1); err != nil {
			return 0, err
		}
	}

	id, err := s.repo.InsertEvent(ctx, repository.InsertEventParams{
		ProjectID:   projectId,
		EventName:   params.Event,
		UserAgent:   core.StrPtr(params.UserAgent),
		SessionID:   core.StrPtr(params.SessionID),
		PagePath:    core.StrPtr(params.Page.Path),
		PageTitle:   core.StrPtr(params.Page.Title),
		Referrer:    core.StrPtr(params.Page.Referrer),
		UtmSource:   core.StrPtr(params.Utm.Source),
		UtmMedium:   core.StrPtr(params.Utm.Medium),
		UtmCampaign: core.StrPtr(params.Utm.Campaign),
		Properties:  props,
	})

	if err != nil {
		return 0, err
	}
	return id, nil

}

func (s *svc) CreateBatchEvents(ctx context.Context, params BatchEventsParams) (int, error) {
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
			return 0, err
		}
	}

	events, err := ToInsertEvents(projectId, params.Events, geo)

	if err != nil {
		return 0, err
	}

	err = s.repo.InsertEventsBatch(ctx, events).Close()

	if err != nil {
		return 0, err

	}
	return len(events), nil

}

func (s *svc) checkUsageLimit(ctx context.Context, projectID uuid.UUID, incoming int) error {
	if incoming <= 0 {
		return nil
	}

	limit, err := s.repo.GetActiveSubscriptionLimitByProject(ctx, projectID)
	if err != nil {
		return errors.New("subscription not found for project owner")
	}

	usage, err := s.repo.GetMonthlyUsageByProject(ctx, projectID)
	if err != nil {
		return errors.New("unable to verify usage limit")
	}

	if usage+int64(incoming) > int64(limit) {
		return ErrMonthlyLimitReached
	}

	return nil
}

func (s *svc) GetProjectConfig(ctx context.Context, projectId string) (ProjectConfig, error) {
	cfg, err := s.repo.GetProjectConfig(ctx, uuid.MustParse(projectId))
	if err != nil {
		return ProjectConfig{}, errors.New("Unable to get project config with this key")
	}
	return cfg, nil

}

func ToInsertEvents(projectID uuid.UUID, events []EventParams, geo *geoip.Location) ([]repository.InsertEventsBatchParams, error) {
	out := make([]repository.InsertEventsBatchParams, 0, len(events))

	for _, e := range events {
		p, err := ToInsertEvent(projectID, e, geo)
		if err != nil {
			return nil, err
		}
		out = append(out, p)
	}

	return out, nil
}

func ToInsertEvent(projectID uuid.UUID, e EventParams, geo *geoip.Location) (repository.InsertEventsBatchParams, error) {
	props, err := json.Marshal(mergeGeoProperties(e.Properties, geo))
	if err != nil {
		return repository.InsertEventsBatchParams{}, err
	}

	return repository.InsertEventsBatchParams{
		ProjectID:   projectID,
		EventName:   e.Event,
		SessionID:   core.StrPtr(e.SessionID),
		UserAgent:   core.StrPtr(e.UserAgent),
		PagePath:    core.StrPtr(e.Page.Path),
		PageTitle:   core.StrPtr(e.Page.Title),
		Referrer:    core.StrPtr(e.Page.Referrer),
		UtmSource:   core.StrPtr(e.Utm.Source),
		UtmMedium:   core.StrPtr(e.Utm.Medium),
		UtmCampaign: core.StrPtr(e.Utm.Campaign),
		Properties:  props,
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
		"region":       geo.Region,
		"city":         geo.City,
		"latitude":     geo.Latitude,
		"longitude":    geo.Longitude,
	}

	return properties
}
