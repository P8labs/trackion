package replay

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"trackion/internal/features/events"
	"trackion/internal/res"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

const (
	maxReplayPayloadBytes = 1 << 20 // 1MB
	maxReplayEventsPerReq = 2000
)

type IngestRequest struct {
	ProjectID string            `json:"project_key"`
	SessionID string            `json:"session_id"`
	Events    []json.RawMessage `json:"events"`
}

type handler struct {
	service Service
}

func NewHandler(service Service) *handler {
	return &handler{service: service}
}

func (h *handler) Ingest(w http.ResponseWriter, r *http.Request) {
	projectIDCtx, ok := r.Context().Value(events.ProjectIdContextKey).(uuid.UUID)
	if !ok {
		res.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	body, err := parseIngestRequest(r)
	if err != nil {
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = h.service.Ingest(r.Context(), IngestParams{
		ProjectID: projectIDCtx,
		SessionID: body.SessionID,
		Events:    body.Events,
	})
	if err != nil {
		if errors.Is(err, ErrInvalidReplayPayload) {
			res.Error(w, "invalid replay payload", http.StatusBadRequest)
			return
		}

		log.Printf("replay ingestion failed: %v", err)
		res.Error(w, "failed to ingest replay", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *handler) ListSessions(w http.ResponseWriter, r *http.Request) {
	projectID := strings.TrimSpace(chi.URLParam(r, "id"))
	if projectID == "" {
		res.Error(w, "project id is required", http.StatusBadRequest)
		return
	}

	limit := 50
	if rawLimit := strings.TrimSpace(r.URL.Query().Get("limit")); rawLimit != "" {
		parsed, err := strconv.Atoi(rawLimit)
		if err != nil {
			res.Error(w, "invalid limit", http.StatusBadRequest)
			return
		}
		limit = parsed
	}

	sessions, err := h.service.ListSessions(r.Context(), projectID, limit)
	if err != nil {
		if strings.Contains(err.Error(), "unauthorized") {
			res.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res.Success(w, sessions, "Replay sessions fetched successfully.")
}

func (h *handler) GetSession(w http.ResponseWriter, r *http.Request) {
	projectID := strings.TrimSpace(chi.URLParam(r, "id"))
	sessionID := strings.TrimSpace(chi.URLParam(r, "sessionId"))

	if projectID == "" || sessionID == "" {
		res.Error(w, "project id and session id are required", http.StatusBadRequest)
		return
	}

	events, err := h.service.GetSessionEvents(r.Context(), projectID, sessionID)
	if err != nil {
		if strings.Contains(err.Error(), "unauthorized") {
			res.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res.Success(w, res.M{
		"session_id": sessionID,
		"events":     events,
	}, "Replay session fetched successfully.")
}

func (h *handler) DeleteSession(w http.ResponseWriter, r *http.Request) {
	projectID := strings.TrimSpace(chi.URLParam(r, "id"))
	sessionID := strings.TrimSpace(chi.URLParam(r, "sessionId"))

	if projectID == "" || sessionID == "" {
		res.Error(w, "project id and session id are required", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteSession(r.Context(), projectID, sessionID); err != nil {
		if strings.Contains(err.Error(), "unauthorized") {
			res.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res.Success(w, res.M{}, "Replay session deleted successfully.")
}

func parseIngestRequest(r *http.Request) (IngestRequest, error) {
	var body IngestRequest

	contentType := strings.TrimSpace(r.Header.Get("Content-Type"))
	if !strings.HasPrefix(contentType, "application/json") {
		return body, errors.New("Content-Type must be application/json")
	}

	r.Body = http.MaxBytesReader(nil, r.Body, maxReplayPayloadBytes)
	rawBody, err := io.ReadAll(r.Body)
	if err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			return body, errors.New("payload too large")
		}
		return body, errors.New("invalid JSON payload")
	}

	if len(rawBody) == 0 {
		return body, errors.New("request body is empty")
	}

	var strict map[string]json.RawMessage
	if err := json.Unmarshal(rawBody, &strict); err != nil {
		return body, errors.New("invalid JSON payload")
	}

	allowed := map[string]struct{}{
		"project_key": {},
		"session_id":  {},
		"events":      {},
	}
	for key := range strict {
		if _, ok := allowed[key]; !ok {
			return body, errors.New("request contains unknown fields")
		}
	}

	if err := json.Unmarshal(rawBody, &body); err != nil {
		return body, errors.New("invalid JSON payload")
	}

	if strings.TrimSpace(body.ProjectID) == "" {
		return body, errors.New("project_key is required")
	}

	if strings.TrimSpace(body.SessionID) == "" {
		return body, errors.New("session_id is required")
	}

	if len(body.Events) == 0 {
		return body, errors.New("events must not be empty")
	}

	if len(body.Events) > maxReplayEventsPerReq {
		return body, errors.New("too many events in a single request")
	}

	return body, nil
}
