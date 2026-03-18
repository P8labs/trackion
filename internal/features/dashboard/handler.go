package dashboard

import (
	"log"
	"net/http"
	"strconv"
	"trackion/internal/res"

	"github.com/go-chi/chi/v5"
)

type handler struct {
	service Service
}

func NewHandler(service Service) *handler {
	return &handler{
		service: service,
	}
}

func (h *handler) GetDashboardData(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	data, err := h.service.GetDashboardData(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, data, "Dashboard data fetched successfully.")
}

func (h *handler) GetProjectEvents(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")
	limitStr := r.URL.Query().Get("limit")
	limit := 50
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 1000 {
			limit = l
		}
	}

	events, err := h.service.GetProjectEvents(r.Context(), projectId, int32(limit))
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, events, "Events fetched successfully.")
}
