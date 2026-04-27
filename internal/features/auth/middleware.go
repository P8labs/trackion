package auth

import (
	"context"
	"net/http"
	"time"
	"trackion/internal/config"
	db "trackion/internal/db/models"
	"trackion/internal/repo"
	"trackion/internal/res"

	"gorm.io/gorm"
)

type Middleware struct {
	db  *gorm.DB
	cfg config.Config
}

const (
	UserIdContextKey = "userId"
	SystemUserID     = "00000000-0000-0000-0000-000000000001"
)

func NewMiddleware(db *gorm.DB, cfg config.Config) *Middleware {
	return &Middleware{
		db:  db,
		cfg: cfg,
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
			res.Error(w, "unauthorized auth token not found", http.StatusUnauthorized)
			return
		}

		session, err := gorm.G[db.Session](m.db).
			Where(repo.Session.Token.Eq(token), repo.Session.ExpiresAt.Gt(time.Now())).
			First(r.Context())

		if err != nil {
			res.Error(w, "can't fetch session at the moment", http.StatusUnauthorized)
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
