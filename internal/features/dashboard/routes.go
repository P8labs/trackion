package dashboard

import (
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func Routes(db *gorm.DB) *chi.Mux {
	service := NewService(db)
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
	r.Get("/{id}/recent-events-paginated", handler.GetRecentEventsPaginated)
	r.Get("/{id}/online-users", handler.GetOnlineUsers)
	r.Get("/{id}/country-data", handler.GetCountryData)
	r.Get("/{id}/country-map-data", handler.GetCountryMapData)
	r.Get("/{id}/traffic-heatmap", handler.GetTrafficHeatmap)

	return r
}
