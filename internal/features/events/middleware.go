package events

import (
	"context"
	"net/http"
	"trackion/internal/repository"
	"trackion/internal/res"
)

type Middleware struct {
	repo repository.Querier
}

const (
	ProjectIdContextKey string = "projectId"
)

func NewMiddleware(repo repository.Querier) *Middleware {
	return &Middleware{
		repo: repo,
	}
}

func (m Middleware) ProjectIDValidation(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		key := r.Header.Get("X-Trackion-Key")
		project, err := m.repo.GetProjectByAPIKey(r.Context(), key)

		if err != nil {
			res.Error(w, "Invalid project key.", 400)
			return
		}
		ctx := context.WithValue(r.Context(), ProjectIdContextKey, project.ID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
