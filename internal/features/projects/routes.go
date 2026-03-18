package projects

import (
	"trackion/internal/repository"

	"github.com/go-chi/chi/v5"
)

func Routes(repo repository.Querier) *chi.Mux {
	r := chi.NewRouter()

	service := NewService(repo)
	handler := NewHandler(service)

	r.Get("/", handler.ListUserProjects)
	r.Post("/", handler.CreateProject)
	r.Get("/{id}", handler.GetProjectDetails)
	r.Put("/{id}", handler.UpdateProject)
	r.Delete("/{id}", handler.DeleteProject)

	return r
}
