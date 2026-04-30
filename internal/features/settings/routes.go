package settings

import (
	"trackion/internal/config"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

// TODO: remove this endpoint, merged with billing usage endpoint
func Routes(db *gorm.DB, cfg config.Config) *chi.Mux {
	r := chi.NewRouter()
	service := NewService(db, cfg)
	handler := NewHandler(service)

	r.Get("/usage", handler.GetUsageSummary)

	return r
}
