package replay

import (
	"trackion/internal/config"
	"trackion/internal/features/events"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func Routes(db *gorm.DB, cfg config.Config) *chi.Mux {
	r := chi.NewRouter()

	eventsMw := events.NewMiddlewareWithConfig(db, cfg)
	service := NewService(db)
	handler := NewHandler(service)

	r.With(eventsMw.AttachProjectContext, eventsMw.OriginDomainValidation, eventsMw.BatchRateLimit).Post("/", handler.Ingest)

	return r
}

func PrivateRoutes(db *gorm.DB) *chi.Mux {
	r := chi.NewRouter()

	service := NewService(db)
	handler := NewHandler(service)

	r.Get("/projects/{id}/sessions", handler.ListSessions)
	r.Get("/projects/{id}/sessions/{sessionId}", handler.GetSession)
	r.Delete("/projects/{id}/sessions/{sessionId}", handler.DeleteSession)

	return r
}
