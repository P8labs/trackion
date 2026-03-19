package settings

import (
	"trackion/internal/config"
	"trackion/internal/repository"

	"github.com/go-chi/chi/v5"
)

func Routes(repo repository.Querier, cfg config.Config) *chi.Mux {
	r := chi.NewRouter()
	service := NewService(repo, cfg)
	handler := NewHandler(service)

	r.Get("/usage", handler.GetUsageSummary)

	return r
}
