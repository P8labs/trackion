package app

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"time"
	"trackion/internal/config"
	"trackion/internal/features/auth"
	"trackion/internal/features/billing"
	"trackion/internal/features/dashboard"
	"trackion/internal/features/errortracking"
	"trackion/internal/features/events"
	"trackion/internal/features/projects"
	"trackion/internal/features/replay"
	"trackion/internal/features/runtime"
	"trackion/internal/features/settings"
	"trackion/internal/features/tracker"
	"trackion/internal/res"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"gorm.io/gorm"
)

type Application struct {
	config  *config.Config
	logger  *slog.Logger
	db      *gorm.DB
	version string
}

func (app *Application) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	c := cors.AllowAll()
	r.Use(c.Handler)

	r.Use(middleware.Timeout(60 * time.Second))

	authService := auth.NewService(app.db, *app.config)
	authHandler := auth.NewHandler(authService, *app.config)
	authMw := auth.NewMiddleware(app.db, *app.config)

	r.Mount("/events", events.Routes(app.db, *app.config))
	r.Mount("/replay", replay.Routes(app.db, *app.config))
	r.Mount("/v1", runtime.PublicRoutes(app.db, *app.config))

	r.Post("/api/auth/verify", authHandler.VerifyToken) // TODO: backwards compatibility, move to should be /api/v1/auth/verify

	if app.config.IsSaaS() {
		auth.InitOAuth(*app.config)
		r.Get("/auth/login/github", authHandler.GithubLogin)
		r.Get("/auth/login/google", authHandler.GoogleLogin)

		r.Get("/auth/callback/github", authHandler.GithubCallback)
		r.Get("/auth/callback/google", authHandler.GoogleCallback)

	}

	// backwords compatibility, move all routes to /api/v1
	r.Route("/api", func(r chi.Router) {
		r.Use(authMw.AuthMiddleware)
		r.Mount("/projects", projects.Routes(app.db, *app.config))
		r.Mount("/runtime", runtime.Routes(app.db, *app.config))
		r.Mount("/analytics", dashboard.Routes(app.db))
		r.Mount("/replay", replay.PrivateRoutes(app.db))
		r.Mount("/errors", errortracking.Routes(app.db))
		r.Mount("/settings", settings.Routes(app.db, *app.config))
		r.Mount("/billing", billing.Routes(app.db, *app.config))
	})

	r.Route("/api/v1", func(r chi.Router) {
		// before auth means public routes that don't require authentication
		r.Post("/auth/verify", authHandler.VerifyToken)

		r.Group(func(r chi.Router) {
			r.Use(authMw.AuthMiddleware)
			// all routes here require authentication
			r.Post("/auth/logout", authHandler.Logout)
			r.Get("/auth/me", authHandler.Me)

			r.Mount("/billing", billing.Routes(app.db, *app.config))
			r.Mount("/projects", projects.Routes(app.db, *app.config))
			r.Mount("/errors", errortracking.Routes(app.db))

			// r.Mount("/analytics", dashboard.Routes(app.db))
		})
	})

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		res.Success(w, map[string]string{
			"status":         "ok",
			"timestamp":      time.Now().Format(time.RFC3339),
			"server_version": app.version,
		}, "OK")
	})

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, app.config.FrontendURL, http.StatusTemporaryRedirect)
	})

	r.Get("/t.js", tracker.ServeTracker)
	r.Get("/t.min.js", tracker.ServeTrackerMin)

	return r
}

func (app *Application) Run(h http.Handler) error {
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

func NewApplication(db *gorm.DB, cfg *config.Config, logger *slog.Logger, version string) *Application {
	return &Application{
		db:      db,
		config:  cfg,
		logger:  logger,
		version: version,
	}
}

func (app *Application) Handler() http.Handler {
	return app.mount()
}
