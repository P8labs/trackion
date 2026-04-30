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

// @deprecated - use /projects/{id}/runtime instead
func Routes(db *gorm.DB, cfg config.Config) *chi.Mux {
	r := chi.NewRouter()
	service := NewService(db, cfg)
	handler := NewHandler(service)

	// backwards compatibility, should be /{id}
	r.Get("/projects/{id}/runtime", handler.GetProjectRuntime)
	r.Put("/projects/{id}/runtime/flags/{key}", handler.UpsertFlag)
	r.Delete("/projects/{id}/runtime/flags/{key}", handler.DeleteFlag)
	r.Put("/projects/{id}/runtime/config/{key}", handler.UpsertConfig)
	r.Delete("/projects/{id}/runtime/config/{key}", handler.DeleteConfig)

	return r
}
