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

// New analytics handlers

func (h *handler) GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	stats, err := h.service.GetDashboardStats(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, stats, "Dashboard stats fetched successfully.")
}

func (h *handler) GetChartData(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")
	timeRange := r.URL.Query().Get("time_range")
	eventFilter := r.URL.Query().Get("event_filter")

	if timeRange == "" {
		timeRange = "today"
	}

	data, err := h.service.GetChartData(r.Context(), projectId, timeRange, eventFilter)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, data, "Chart data fetched successfully.")
}

func (h *handler) GetBreakdownData(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	data, err := h.service.GetBreakdownData(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, data, "Breakdown data fetched successfully.")
}

func (h *handler) GetRecentEventsData(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")
	limitStr := r.URL.Query().Get("limit")
	limit := 20
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	events, err := h.service.GetRecentEventsData(r.Context(), projectId, int32(limit))
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, events, "Recent events fetched successfully.")
}

// New optimized handlers

func (h *handler) GetDashboardCounts(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	counts, err := h.service.GetDashboardCounts(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, counts, "Dashboard counts fetched successfully.")
}

func (h *handler) GetChartDataFlexible(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	request := ChartDataRequest{
		TimeRange:   r.URL.Query().Get("time_range"),
		EventFilter: r.URL.Query().Get("event_filter"),
	}

	if request.TimeRange == "" {
		request.TimeRange = "24h"
	}

	// TODO: Handle custom date ranges from query params if needed

	data, err := h.service.GetChartDataFlexible(r.Context(), projectId, request)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, data, "Chart data fetched successfully.")
}

func (h *handler) GetDeviceAnalytics(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	data, err := h.service.GetDeviceAnalytics(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, data, "Device analytics fetched successfully.")
}

func (h *handler) GetTrafficSources(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	data, err := h.service.GetTrafficSources(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, data, "Traffic sources fetched successfully.")
}

func (h *handler) GetTopPages(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	pages, err := h.service.GetTopPages(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, pages, "Top pages fetched successfully.")
}

func (h *handler) GetRecentEventsFormatted(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")
	limitStr := r.URL.Query().Get("limit")
	limit := 50
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	events, err := h.service.GetRecentEventsFormatted(r.Context(), projectId, int32(limit))
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, events, "Recent events fetched successfully.")
}
