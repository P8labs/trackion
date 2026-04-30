package runtime

import (
	"trackion/internal/config"
	"trackion/internal/features/events"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func PublicRoutes(db *gorm.DB, cfg config.Config) *chi.Mux {
	r := chi.NewRouter()

	eventsMw := events.NewMiddlewareWithConfig(db, cfg)

	service := NewService(db, cfg)
	handler := NewHandler(service)

	r.With(eventsMw.ProjectIDValidation).Get("/runtime", handler.GetRuntime)

	return r
}
