package events

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"trackion/internal/config"
	"trackion/internal/core"
	"trackion/internal/core/geoip"
	db "trackion/internal/db/models"
	"trackion/internal/features/billing"
	"trackion/internal/repo"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	db          *gorm.DB
	cfg         config.Config
	geoResolver geoip.Resolver
	billing     *billing.Service
}

var ErrMonthlyLimitReached = errors.New("monthly event limit reached for current subscription")

func NewService(db *gorm.DB, cfg config.Config) Service {
	return Service{
		db:          db,
		cfg:         cfg,
		geoResolver: geoip.New(cfg),
		billing:     billing.NewService(db, &cfg),
	}
}

func (s *Service) CreateEvent(ctx context.Context, params EventParams) error {
	projectId := ctx.Value(ProjectIdContextKey).(uuid.UUID)

	var project db.Project
	project, err := gorm.G[db.Project](s.db).
		Select("user_id").
		Where(repo.Project.ID.Eq(projectId)).
		First(ctx)

	if err != nil {
		return err
	}

	if err := s.billing.CheckEventLimit(ctx, project.UserID, 1); err != nil {
		return ErrMonthlyLimitReached
	}

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

		if err := s.billing.IncrementEventUsage(ctx, project.UserID, 1); err != nil {
			log.Printf("Failed to increment event usage for user %s: %v", project.UserID, err)
			// Don't fail the request if usage tracking fails
		}

		return nil
	})

	return err
}

func (s *Service) CreateBatchEvents(ctx context.Context, params BatchEventsParams) error {
	projectId := ctx.Value(ProjectIdContextKey).(uuid.UUID)

	eventCount := len(params.Events)
	if eventCount == 0 {
		return nil
	}

	var project db.Project
	project, err := gorm.G[db.Project](s.db).
		Select("user_id").
		Where(repo.Project.ID.Eq(projectId)).
		First(ctx)
	if err != nil {
		return err
	}

	if err := s.billing.CheckEventLimit(ctx, project.UserID, eventCount); err != nil {
		return ErrMonthlyLimitReached
	}

	var geo *geoip.Location
	geo, err = s.geoResolver.Resolve(ctx, params.Events[0].ClientIP)
	if err != nil {
		log.Printf("geo lookup failed for ip=%s: %v", params.Events[0].ClientIP, err)
	}

	events, err := ToInsertEvents(projectId, params.Events, geo)
	if err != nil {
		return err
	}

	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.CreateInBatches(&events, len(events)).Error; err != nil {
			return err
		}

		if err := s.billing.IncrementEventUsage(ctx, project.UserID, eventCount); err != nil {
			log.Printf("Failed to increment event usage for user %s: %v", project.UserID, err)
			// Don't fail the request if usage tracking fails
		}

		return nil
	})

	return err
}

func (s *Service) GetProjectConfig(ctx context.Context, projectId string) (ProjectConfig, error) {
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
