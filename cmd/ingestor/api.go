package main

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"time"
	"trackion/internal/config"
	"trackion/internal/features/events"
	"trackion/internal/features/tracker"
	"trackion/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5"
)

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID) // important for rate limiting
	r.Use(middleware.RealIP)    // import for rate limiting
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer) // recover from crashes

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	repo := repository.New(app.db)

	r.Mount("/events", events.Routes(repo))

	// auth related

	// admin related

	// projectsService := projects.NewService(repository.New(app.db))
	// projectsHandler := projects.NewHandler(projectsService)
	// r.Post("/projects", projectsHandler.CreateProject)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("all good"))
	})
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	r.Get("/t.js", tracker.ServeTracker)
	r.Get("/t.min.js", tracker.ServeTrackerMin)

	return r
}

func (app *application) run(h http.Handler) error {
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", app.config.Port),
		Handler:      h,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	log.Printf("server has started at addr %s", app.config.Port)

	return srv.ListenAndServe()
}

type application struct {
	config *config.Config
	logger *slog.Logger
	db     *pgx.Conn
}
