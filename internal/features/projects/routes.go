package projects

import (
	"trackion/internal/config"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func Routes(db *gorm.DB, cfg config.Config) *chi.Mux {
	r := chi.NewRouter()

	service := NewService(db, cfg)
	handler := NewHandler(service)

	r.Get("/", handler.ListUserProjects)
	r.Post("/", handler.CreateProject)
	r.Get("/{id}", handler.GetProjectDetails)
	r.Put("/{id}", handler.UpdateProject)
	r.Delete("/{id}", handler.DeleteProject)

	return r
}
