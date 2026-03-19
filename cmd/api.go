package main

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"time"
	"trackion/internal/config"
	"trackion/internal/features/auth"
	"trackion/internal/features/dashboard"
	"trackion/internal/features/events"
	"trackion/internal/features/projects"
	"trackion/internal/features/settings"
	"trackion/internal/features/tracker"
	"trackion/internal/repository"
	"trackion/internal/res"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
)

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID) // important for rate limiting
	r.Use(middleware.RealIP)    // import for rate limiting
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer) // recover from crashes

	c := cors.AllowAll()
	r.Use(c.Handler)

	r.Use(middleware.Timeout(60 * time.Second))

	repo := repository.New(app.db)
	authService := auth.NewService(repo, *app.config)
	authHandler := auth.NewHandler(authService, *app.config)

	r.Mount("/events", events.Routes(repo, *app.config))
	r.Post("/api/auth/verify", authHandler.VerifyToken)

	// auth related
	if app.config.IsSaaS() {
		auth.InitOAuth(*app.config)
		r.Mount("/auth", auth.Routes(repo))
	}

	// authenticated APIs
	mw := auth.NewMiddleware(repo, *app.config)

	r.Route("/api", func(r chi.Router) {
		r.Use(mw.AuthMiddleware)
		r.Mount("/projects", projects.Routes(repo))
		r.Mount("/analytics", dashboard.Routes(repo))
		r.Mount("/settings", settings.Routes(repo, *app.config))
	})

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		if err := app.db.Ping(r.Context()); err != nil {
			res.Error(w, "Database unavailable", 503)
			return
		}

		res.Success(w, map[string]string{
			"status":    "ok",
			"timestamp": time.Now().Format(time.RFC3339),
		}, "OK")
	})

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, app.config.FrontendURL, http.StatusTemporaryRedirect)
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
	db     *pgxpool.Pool
}
