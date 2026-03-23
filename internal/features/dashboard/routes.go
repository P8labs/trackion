package dashboard

import (
	"trackion/internal/repository"

	"github.com/go-chi/chi/v5"
)

func Routes(repo repository.Querier) *chi.Mux {
	service := NewService(repo)
	return newRouter(service)
}

func newRouter(service Service) *chi.Mux {
	r := chi.NewRouter()
	handler := NewHandler(service)

	// Active analytics endpoints
	r.Get("/{id}/counts", handler.GetDashboardCounts)
	r.Get("/{id}/chart-data", handler.GetChartDataFlexible)
	r.Get("/{id}/area-chart-data", handler.GetAreaChartData)
	r.Get("/{id}/device-analytics", handler.GetDeviceAnalytics)
	r.Get("/{id}/traffic-sources", handler.GetTrafficSources)
	r.Get("/{id}/top-pages", handler.GetTopPages)
	r.Get("/{id}/recent-events", handler.GetRecentEventsFormatted)
	r.Get("/{id}/online-users", handler.GetOnlineUsers)
	r.Get("/{id}/country-data", handler.GetCountryData)

	return r
}
