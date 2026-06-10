package auth

import (
	"context"
	"net/http"
	"time"
	"trackion/internal/config"
	"trackion/internal/core"
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
)

func NewMiddleware(db *gorm.DB, cfg config.Config) *Middleware {
	return &Middleware{
		db:  db,
		cfg: cfg,
	}
}

func (m *Middleware) AuthMiddleware(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, err := tryExtractToken(r)

		if err != nil {
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

// tryExtractToken tries to extract the token from the Authorization header or cookie
// and makes sure it exists, otherwise returns an error
func tryExtractToken(r *http.Request) (string, error) {
	token := core.ExtractBearer(r)

	if token == "" {
		cookie, err := r.Cookie("trackion_session")
		if err != nil {
			return "", err
		}
		token = cookie.Value
	}

	if token == "" {
		return "", http.ErrNoCookie
	}

	return token, nil
}
