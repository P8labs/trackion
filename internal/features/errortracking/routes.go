package errortracking

import (
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func Routes(db *gorm.DB) *chi.Mux {
	service := NewService(db)
	return newRouter(service)
}

func newRouter(service Service) *chi.Mux {
	r := chi.NewRouter()
	handler := NewHandler(service)

	r.Get("/", handler.ListErrors)
	r.Get("/{fingerprint}", handler.GetErrorDetail)
	r.Get("/stats", handler.GetErrorStats)

	return r
}
