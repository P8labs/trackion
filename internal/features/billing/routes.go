package billing

import (
	"trackion/internal/config"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func Routes(db *gorm.DB, cfg config.Config) *chi.Mux {
	r := chi.NewRouter()

	service := NewService(db, &cfg)
	handler := NewHandler(service)

	r.Get("/plans", handler.ListPlans)
	r.Post("/setup/{plan}", handler.SetupSubscription)

	r.Get("/usage", handler.GetUsage)

	return r
}
