package dashboard

import (
	"trackion/internal/repository"

	"github.com/go-chi/chi/v5"
)

func Routes(repo repository.Querier) *chi.Mux {
	r := chi.NewRouter()

	service := NewService(repo)
	handler := NewHandler(service)

	// Legacy dashboard endpoint (for backward compatibility)
	r.Get("/{id}/dashboard", handler.GetDashboardData)
	r.Get("/{id}/events", handler.GetProjectEvents)

	// Legacy analytics endpoints (keeping for backward compatibility)
	r.Get("/{id}/stats", handler.GetDashboardStats)
	r.Get("/{id}/chart", handler.GetChartData)
	r.Get("/{id}/breakdown", handler.GetBreakdownData)
	r.Get("/{id}/recent", handler.GetRecentEventsData)

	// New optimized endpoints
	r.Get("/{id}/counts", handler.GetDashboardCounts)
	r.Get("/{id}/chart-data", handler.GetChartDataFlexible)
	r.Get("/{id}/area-chart-data", handler.GetAreaChartData)
	r.Get("/{id}/device-analytics", handler.GetDeviceAnalytics)
	r.Get("/{id}/traffic-sources", handler.GetTrafficSources)
	r.Get("/{id}/top-pages", handler.GetTopPages)
	r.Get("/{id}/recent-events", handler.GetRecentEventsFormatted)

	return r
}
