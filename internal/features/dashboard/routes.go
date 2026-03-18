package dashboard

import (
	"trackion/internal/repository"

	"github.com/go-chi/chi/v5"
)

func Routes(repo repository.Querier) *chi.Mux {
	r := chi.NewRouter()

	service := NewService(repo)
	handler := NewHandler(service)

	r.Get("/{id}/dashboard", handler.GetDashboardData)
	r.Get("/{id}/events", handler.GetProjectEvents)

	return r
}
