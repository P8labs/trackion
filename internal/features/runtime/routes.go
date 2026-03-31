package runtime

import (
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func PublicRoutes(db *gorm.DB) *chi.Mux {
	r := chi.NewRouter()
	service := NewService(db)
	handler := NewHandler(service)

	r.Get("/runtime", handler.GetRuntime)

	return r
}

func Routes(db *gorm.DB) *chi.Mux {
	r := chi.NewRouter()
	service := NewService(db)
	handler := NewHandler(service)

	r.Get("/projects/{id}/runtime", handler.GetProjectRuntime)
	r.Put("/projects/{id}/runtime/flags/{key}", handler.UpsertFlag)
	r.Delete("/projects/{id}/runtime/flags/{key}", handler.DeleteFlag)
	r.Put("/projects/{id}/runtime/config/{key}", handler.UpsertConfig)
	r.Delete("/projects/{id}/runtime/config/{key}", handler.DeleteConfig)

	return r
}
