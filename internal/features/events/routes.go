package events

import (
	"trackion/internal/config"
	"trackion/internal/repository"

	"github.com/go-chi/chi/v5"
)

func Routes(repo repository.Querier, cfg config.Config) *chi.Mux {
	r := chi.NewRouter()

	mw := NewMiddlewareWithConfig(repo, cfg)
	eventService := NewService(repo, cfg)
	eventHandler := NewHandler(eventService)

	r.With(mw.ProjectIDValidation, mw.OriginDomainValidation).Post("/collect", eventHandler.CollectEvent)
	r.With(mw.AttachProjectContext, mw.BatchRateLimit, mw.ProjectIDValidation, mw.OriginDomainValidation).Post("/batch", eventHandler.CollectBatchEvents)
	r.With(mw.ProjectIDValidation).Get("/config", eventHandler.ProjectConfig)
	return r
}
