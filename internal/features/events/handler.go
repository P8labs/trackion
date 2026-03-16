package events

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"trackion/internal/res"
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

	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	id, err := h.service.CreateEvent(r.Context(), body)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	res.Success(w, res.M{"eventId": id}, "event recorded.")
}

func (h *handler) ProjectConfig(w http.ResponseWriter, r *http.Request) {

	projectKey := r.URL.Query().Get("key")
	if projectKey == "" {
		res.Error(w, "missing project key", 400)
		return
	}

	ctx := r.Context()

	projectConfig, err := h.service.GetProjectConfig(ctx, projectKey)
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

	res.SuccessRaw(w, projectConfig)

}

func (h *handler) CollectBatchEvents(w http.ResponseWriter, r *http.Request) {
	body, err := res.Parse[EventParams](r)

	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	id, err := h.service.CreateEvent(r.Context(), body)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	res.Success(w, res.M{"eventId": id}, "event recorded.")
}
