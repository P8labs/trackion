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

func (h *handler) GetRecentEventsPaginated(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")
	pageStr := r.URL.Query().Get("page")
	pageSizeStr := r.URL.Query().Get("page_size")

	page := int32(1)
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = int32(p)
		}
	}

	pageSize := int32(20)
	if pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 && ps <= 100 {
			pageSize = int32(ps)
		}
	}

	paginatedEvents, err := h.service.GetRecentEventsPaginated(r.Context(), projectId, page, pageSize)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, paginatedEvents, "Recent events fetched successfully.")
}

func (h *handler) GetAreaChartData(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")
	timeRange := r.URL.Query().Get("time_range")
	if timeRange == "" {
		timeRange = "7d"
	}

	eventFilter := r.URL.Query().Get("event_filter")

	data, err := h.service.GetAreaChartData(r.Context(), projectId, timeRange, eventFilter)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, data, "Area chart data fetched successfully.")
}

func (h *handler) GetOnlineUsers(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	count, err := h.service.GetOnlineUsers(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, map[string]int64{"online_users": count}, "Online users fetched successfully.")
}

func (h *handler) GetCountryData(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	data, err := h.service.GetCountryData(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, data, "Country data fetched successfully.")
}

func (h *handler) GetCountryMapData(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	data, err := h.service.GetCountryMapData(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, data, "Country map data fetched successfully.")
}

func (h *handler) GetTrafficHeatmap(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	data, err := h.service.GetTrafficHeatmap(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 500)
		return
	}

	res.Success(w, data, "Traffic heatmap fetched successfully.")
}
