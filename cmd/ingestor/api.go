package main

import (
	"log"
	"log/slog"
	"net/http"
	"time"
	"trackion/internal/repository"
	"trackion/internal/routes/events"
	"trackion/internal/routes/projects"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5"
)

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID) // important for rate limiting
	r.Use(middleware.RealIP)    // import for rate limiting and analytics and tracing
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer) // recover from crashes

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("all good"))
	})
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	eventService := events.NewService(repository.New(app.db))
	eventHandler := events.NewHandler(eventService)
	r.Post("/collect", eventHandler.CollectEvent)

	projectsService := projects.NewService(repository.New(app.db))
	projectsHandler := projects.NewHandler(projectsService)

	r.Post("/projects", projectsHandler.CreateProject)

	return r
}

func (app *application) run(h http.Handler) error {
	srv := &http.Server{
		Addr:         app.config.addr,
		Handler:      h,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	log.Printf("server has started at addr %s", app.config.addr)

	return srv.ListenAndServe()
}

type application struct {
	config appConfig
	logger *slog.Logger
	db     *pgx.Conn
}

type appConfig struct {
	addr string
	db   dbConfig
}

type dbConfig struct {
	url string
}
