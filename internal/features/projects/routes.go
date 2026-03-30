package projects

import (
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func Routes(db *gorm.DB) *chi.Mux {
	r := chi.NewRouter()

	service := NewService(db)
	handler := NewHandler(service)

	r.Get("/", handler.ListUserProjects)
	r.Post("/", handler.CreateProject)
	r.Get("/{id}", handler.GetProjectDetails)
	r.Put("/{id}", handler.UpdateProject)
	r.Delete("/{id}", handler.DeleteProject)

	return r
}
