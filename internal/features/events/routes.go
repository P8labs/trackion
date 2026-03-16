package events

import (
	"trackion/internal/repository"

	"github.com/go-chi/chi/v5"
)

func Routes(repo repository.Querier) *chi.Mux {
	r := chi.NewRouter()

	mw := Middleware{repo}
	eventService := NewService(repo)
	eventHandler := NewHandler(eventService)

	r.Use(mw.ProjectIDValidation)
	r.Post("/collect", eventHandler.CollectEvent)
	r.Get("/batch", eventHandler.CollectBatchEvents)
	r.Get("/config", eventHandler.ProjectConfig)
	return r
}
