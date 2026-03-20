package events

import (
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"trackion/internal/res"

	"github.com/google/uuid"
)

type handler struct {
	service Service
}

func NewHandler(service Service) *handler {
	return &handler{
		service: service,
	}
}

func (h *handler) CollectEvent(w http.ResponseWriter, r *http.Request) {
	body, err := res.Parse[EventParams](r)
	body.ClientIP = getClientIP(r)

	ua := strings.TrimSpace(body.UserAgent)
	if ua == "" {
		ua = r.Header.Get("User-Agent")
	}
	body.UserAgent = ua

	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	id, err := h.service.CreateEvent(r.Context(), body)
	if err != nil {
		log.Println(err)
		if errors.Is(err, ErrMonthlyLimitReached) {
			res.Error(w, err.Error(), http.StatusTooManyRequests)
			return
		}
		res.Error(w, err.Error(), 400)
		return
	}

	res.Success(w, res.M{"eventId": id}, "event recorded.")
}

func (h *handler) ProjectConfig(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	projectId := ctx.Value(ProjectIdContextKey).(uuid.UUID)

	projectConfig, err := h.service.GetProjectConfig(ctx, projectId.String())
	if err != nil {
		res.Error(w, "invalid project key", 401)
		return
	}

	b, err := json.Marshal(projectConfig)
	if err != nil {
		http.Error(w, "failed to encode config", http.StatusInternalServerError)
		return
	}
	sum := sha256.Sum256([]byte(b))
	etag := fmt.Sprintf(`"cfg-%x"`, sum)

	if r.Header.Get("If-None-Match") == etag {
		w.WriteHeader(http.StatusNotModified)
		return

	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	w.Header().Set("ETag", etag)

	res.Success(w, projectConfig, "Project CONFIG")

}

func (h *handler) CollectBatchEvents(w http.ResponseWriter, r *http.Request) {
	body, err := res.Parse[BatchEventsParams](r)
	clientIP := getClientIP(r)

	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	headerUA := r.Header.Get("User-Agent")

	for i := range body.Events {
		body.Events[i].ClientIP = clientIP
		if body.Events[i].UserAgent == "" {
			body.Events[i].UserAgent = headerUA
		}
	}

	id, err := h.service.CreateBatchEvents(r.Context(), body)
	if err != nil {
		log.Println(err)
		if errors.Is(err, ErrMonthlyLimitReached) {
			res.Error(w, err.Error(), 429)
			return
		}
		res.Error(w, err.Error(), 400)
		return
	}

	res.Success(w, res.M{"eventId": id}, "event recorded.")
}
