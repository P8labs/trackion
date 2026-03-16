package auth

import (
	"context"
	"net/http"
	"trackion/internal/config"
	"trackion/internal/repository"
	"trackion/internal/res"
)

type Middleware struct {
	repo repository.Querier
	cfg  config.Config
}

const (
	UserIdContextKey = "userId"
	SystemUserID     = "00000000-0000-0000-0000-000000000001"
)

func NewMiddleware(repo repository.Querier, cfg config.Config) *Middleware {
	return &Middleware{
		repo: repo,
		cfg:  cfg,
	}
}

func (m *Middleware) AuthMiddleware(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if m.cfg.IsSelfHost() {

			token := extractBearer(r)

			if token != m.cfg.AdminToken {
				res.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserIdContextKey, SystemUserID)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		token := extractBearer(r)

		if token == "" {
			cookie, err := r.Cookie("trackion_session")
			if err == nil {
				token = cookie.Value
			}
		}

		if token == "" {
			res.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		session, err := m.repo.GetSessionByToken(r.Context(), token)
		if err != nil {
			res.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserIdContextKey, session.UserID.String())

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func extractBearer(r *http.Request) string {

	auth := r.Header.Get("Authorization")

	const prefix = "Bearer "

	if len(auth) > len(prefix) && auth[:len(prefix)] == prefix {
		return auth[len(prefix):]
	}

	return ""
}
