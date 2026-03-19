package auth

import (
	"trackion/internal/config"
	"trackion/internal/repository"

	"github.com/go-chi/chi/v5"
)

func Routes(repo repository.Querier) *chi.Mux {
	r := chi.NewRouter()
	cfg := config.Load()
	mw := NewMiddleware(repo, *cfg)
	authService := NewService(repo, *cfg)
	authHandler := NewHandler(authService, *cfg)

	r.Get("/login/github", authHandler.GithubLogin)
	r.Get("/callback/github", authHandler.GithubCallback)

	r.Group(func(r chi.Router) {
		r.Use(mw.AuthMiddleware)

		r.Get("/me", authHandler.Me)
		r.Post("/logout", authHandler.Logout)
	})

	return r
}
