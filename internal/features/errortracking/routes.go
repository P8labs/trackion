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

	// Error tracking endpoints
	r.Get("/", handler.ListErrors)                  // GET /api/errors?project_id={id}
	r.Get("/{fingerprint}", handler.GetErrorDetail) // GET /api/errors/{fingerprint}?project_id={id}
	r.Get("/stats", handler.GetErrorStats)          // GET /api/errors/stats?project_id={id}

	return r
}
