package events

import (
	"trackion/internal/config"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func Routes(db *gorm.DB, cfg config.Config) *chi.Mux {
	r := chi.NewRouter()

	mw := NewMiddlewareWithConfig(db, cfg)
	eventService := NewService(db, cfg)
	eventHandler := NewHandler(eventService)

	r.With(mw.ProjectIDValidation, mw.OriginDomainValidation).Post("/collect", eventHandler.CollectEvent)
	r.With(mw.AttachProjectContext, mw.BatchRateLimit, mw.ProjectIDValidation, mw.OriginDomainValidation).Post("/batch", eventHandler.CollectBatchEvents)
	r.With(mw.ProjectIDValidation).Get("/config", eventHandler.ProjectConfig)
	return r
}
