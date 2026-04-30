package dashboard

import (
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func Routes(db *gorm.DB) *chi.Mux {
	r := chi.NewRouter()
	service := NewService(db)
	handler := NewHandler(service)

	r.Get("/{id}/online-users", handler.GetOnlineUsers)
	r.Get("/{id}/chart-data", handler.GetAreaChartData)
	r.Get("/{id}/counts", handler.GetDashboardCounts)
	r.Get("/{id}/country-map", handler.GetCountryMapData)
	r.Get("/{id}/traffic-heatmap", handler.GetTrafficHeatmap)
	r.Get("/{id}/recent-events", handler.GetRecentEvents)
	r.Get("/{id}/realtime-events", handler.GetRealtimeEvents)
	r.Get("/{id}/device-analytics", handler.GetDeviceAnalytics)
	r.Get("/{id}/traffic-sources", handler.GetTrafficSources)
	r.Get("/{id}/top-countries", handler.GetCountryData)
	r.Get("/{id}/top-pages", handler.GetTopPages)

	return r
}
