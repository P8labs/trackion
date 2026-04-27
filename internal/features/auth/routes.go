package auth

import (
	"trackion/internal/config"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func Routes(db *gorm.DB, cfg config.Config) *chi.Mux {
	r := chi.NewRouter()
	mw := NewMiddleware(db, cfg)
	authService := NewService(db, cfg)
	authHandler := NewHandler(authService, cfg)

	r.Get("/login/github", authHandler.GithubLogin)
	r.Get("/login/google", authHandler.GoogleLogin)
	r.Get("/callback/github", authHandler.GithubCallback)
	r.Get("/callback/google", authHandler.GoogleCallback)

	r.Group(func(r chi.Router) {
		r.Use(mw.AuthMiddleware)

		r.Get("/me", authHandler.Me)
		r.Post("/logout", authHandler.Logout)
	})

	return r
}
