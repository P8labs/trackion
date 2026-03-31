package runtime

import (
	"log"
	"net/http"
	"strings"
	"trackion/internal/res"

	"github.com/go-chi/chi/v5"
)

type handler struct {
	service Service
}

func NewHandler(service Service) *handler {
	return &handler{service: service}
}

func (h *handler) GetRuntime(w http.ResponseWriter, r *http.Request) {
	projectID := strings.TrimSpace(r.URL.Query().Get("project_id"))
	userID := strings.TrimSpace(r.URL.Query().Get("user_id"))

	data, err := h.service.GetPublicRuntime(r.Context(), projectID, userID)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res.Success(w, data, "Runtime fetched successfully.")
}

func (h *handler) GetProjectRuntime(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")

	data, err := h.service.GetProjectRuntime(r.Context(), projectID)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res.Success(w, data, "Runtime settings fetched successfully.")
}

func (h *handler) UpsertFlag(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")
	key := chi.URLParam(r, "key")

	body, err := res.Parse[UpsertFlagParams](r)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.UpsertFlag(r.Context(), projectID, key, body); err != nil {
		log.Println(err)
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res.Success(w, res.M{}, "Flag updated successfully.")
}

func (h *handler) DeleteFlag(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")
	key := chi.URLParam(r, "key")

	if err := h.service.DeleteFlag(r.Context(), projectID, key); err != nil {
		log.Println(err)
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res.Success(w, res.M{}, "Flag deleted successfully.")
}

func (h *handler) UpsertConfig(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")
	key := chi.URLParam(r, "key")

	body, err := res.Parse[UpsertConfigParams](r)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.UpsertConfig(r.Context(), projectID, key, body); err != nil {
		log.Println(err)
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res.Success(w, res.M{}, "Config updated successfully.")
}

func (h *handler) DeleteConfig(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")
	key := chi.URLParam(r, "key")

	if err := h.service.DeleteConfig(r.Context(), projectID, key); err != nil {
		log.Println(err)
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res.Success(w, res.M{}, "Config deleted successfully.")
}
