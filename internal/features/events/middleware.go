package events

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
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

		key := r.Header.Get("X-Project-Key")

		// This reads the body and then restores it. New thing learnt
		if key == "" && r.Body != nil {
			bodyBytes, err := io.ReadAll(r.Body)
			if err == nil && len(bodyBytes) > 0 {

				r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

				var payload struct {
					ProjectKey string `json:"project_key"`
				}

				if err := json.Unmarshal(bodyBytes, &payload); err == nil {
					key = payload.ProjectKey
				}
			}
		}

		if key == "" {
			res.Error(w, "Missing project key", 400)
			return
		}

		project, err := m.repo.GetProjectByAPIKey(r.Context(), key)
		if err != nil {
			res.Error(w, "Invalid project key.", 400)
			return
		}

		ctx := context.WithValue(r.Context(), ProjectIdContextKey, project.ID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
