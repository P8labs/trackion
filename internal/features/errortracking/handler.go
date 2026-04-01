package errortracking

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

func (h *handler) ListErrors(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("project_id")
	if projectID == "" {
		res.Error(w, "project_id is required", http.StatusBadRequest)
		return
	}

	timeRange := r.URL.Query().Get("time_range")
	if timeRange == "" {
		timeRange = "7d" // default to 7 days
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	req := ErrorListRequest{
		ProjectID: projectID,
		TimeRange: timeRange,
		Limit:     limit,
		Offset:    offset,
	}

	errors, err := h.service.ListGroupedErrors(r.Context(), req)
	if err != nil {
		log.Printf("error listing grouped errors: %v", err)
		res.Error(w, "failed to fetch errors", http.StatusInternalServerError)
		return
	}

	res.Success(w, errors, "Errors fetched successfully.")
}

func (h *handler) GetErrorDetail(w http.ResponseWriter, r *http.Request) {
	fingerprint := chi.URLParam(r, "fingerprint")
	if fingerprint == "" {
		res.Error(w, "fingerprint is required", http.StatusBadRequest)
		return
	}

	projectID := r.URL.Query().Get("project_id")
	if projectID == "" {
		res.Error(w, "project_id is required", http.StatusBadRequest)
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	req := ErrorDetailRequest{
		ProjectID:   projectID,
		Fingerprint: fingerprint,
		Limit:       limit,
		Offset:      offset,
	}

	occurrences, err := h.service.GetErrorOccurrences(r.Context(), req)
	if err != nil {
		log.Printf("error fetching error detail: %v", err)
		res.Error(w, "failed to fetch error occurrences", http.StatusInternalServerError)
		return
	}

	res.Success(w, occurrences, "Error occurrences fetched successfully.")
}

func (h *handler) GetErrorStats(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("project_id")
	if projectID == "" {
		res.Error(w, "project_id is required", http.StatusBadRequest)
		return
	}

	timeRange := r.URL.Query().Get("time_range")
	if timeRange == "" {
		timeRange = "7d"
	}

	count, err := h.service.GetErrorCount(r.Context(), projectID, timeRange)
	if err != nil {
		log.Printf("error fetching error count: %v", err)
		res.Error(w, "failed to fetch error stats", http.StatusInternalServerError)
		return
	}

	stats := map[string]interface{}{
		"total_errors": count,
		"time_range":   timeRange,
	}

	res.Success(w, stats, "Error stats fetched successfully.")
}
