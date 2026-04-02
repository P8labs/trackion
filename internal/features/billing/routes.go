package billing

import (
	"trackion/internal/config"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func Routes(db *gorm.DB, cfg config.Config) *chi.Mux {
	r := chi.NewRouter()

	service := NewService(db)
	handler := NewHandler(service)

	r.Get("/usage", handler.GetUsage)
	r.Get("/plan", handler.GetPlan)

	return r
}
