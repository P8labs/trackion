package dashboard

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"trackion/internal/repository"

	"github.com/google/uuid"
)

type mockDashboardService struct {
	recentLimit     int32
	recentErr       error
	areaTimeRange   string
	areaEventFilter string
}

func (m *mockDashboardService) GetProjectEvents(context.Context, string, int32) ([]repository.Event, error) {
	return []repository.Event{}, nil
}

func (m *mockDashboardService) GetChartData(context.Context, string, string, string) ([]ChartDataPoint, error) {
	return []ChartDataPoint{}, nil
}

func (m *mockDashboardService) GetBreakdownData(context.Context, string) (*BreakdownData, error) {
	return &BreakdownData{}, nil
}

func (m *mockDashboardService) GetRecentEventsData(context.Context, string, int32) ([]RecentEventData, error) {
	return []RecentEventData{}, nil
}

func (m *mockDashboardService) GetDashboardCounts(context.Context, string) (*DashboardCounts, error) {
	return &DashboardCounts{}, nil
}

func (m *mockDashboardService) GetChartDataFlexible(context.Context, string, ChartDataRequest) ([]ChartDataPoint, error) {
	return []ChartDataPoint{}, nil
}

func (m *mockDashboardService) GetAreaChartData(_ context.Context, _ string, timeRange string, eventFilter string) ([]AreaChartDataPoint, error) {
	m.areaTimeRange = timeRange
	m.areaEventFilter = eventFilter
	return []AreaChartDataPoint{}, nil
}

func (m *mockDashboardService) GetDeviceAnalytics(context.Context, string) (*DeviceAnalyticsData, error) {
	return &DeviceAnalyticsData{}, nil
}

func (m *mockDashboardService) GetTrafficSources(context.Context, string) (*TrafficSourcesData, error) {
	return &TrafficSourcesData{}, nil
}

func (m *mockDashboardService) GetTopPages(context.Context, string) ([]TopPage, error) {
	return []TopPage{}, nil
}

func (m *mockDashboardService) GetRecentEventsFormatted(_ context.Context, _ string, limit int32) ([]RecentEventData, error) {
	m.recentLimit = limit
	if m.recentErr != nil {
		return nil, m.recentErr
	}
	return []RecentEventData{}, nil
}

func (m *mockDashboardService) GetOnlineUsers(context.Context, string) (int64, error) {
	return 0, nil
}

func (m *mockDashboardService) GetCountryData(context.Context, string) ([]BreakdownItem, error) {
	return []BreakdownItem{}, nil
}

func TestRoutes_LegacyEndpointsRemoved(t *testing.T) {
	r := newRouter(&mockDashboardService{})
	projectID := uuid.NewString()

	legacyPaths := []string{
		"/" + projectID + "/dashboard",
		"/" + projectID + "/events",
		"/" + projectID + "/stats",
		"/" + projectID + "/chart",
		"/" + projectID + "/breakdown",
		"/" + projectID + "/recent",
	}

	for _, path := range legacyPaths {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		rr := httptest.NewRecorder()
		r.ServeHTTP(rr, req)

		if rr.Code != http.StatusNotFound {
			t.Fatalf("expected 404 for legacy path %s, got %d", path, rr.Code)
		}
	}
}

func TestRoutes_RecentEventsLimitDefaultsAndBounds(t *testing.T) {
	tests := []struct {
		name     string
		query    string
		expected int32
	}{
		{name: "defaultWhenMissing", query: "", expected: 50},
		{name: "defaultWhenZero", query: "?limit=0", expected: 50},
		{name: "defaultWhenNegative", query: "?limit=-12", expected: 50},
		{name: "defaultWhenOverMax", query: "?limit=999", expected: 50},
		{name: "usesProvidedLimit", query: "?limit=25", expected: 25},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			svc := &mockDashboardService{}
			r := newRouter(svc)
			projectID := uuid.NewString()

			req := httptest.NewRequest(http.MethodGet, "/"+projectID+"/recent-events"+tc.query, nil)
			rr := httptest.NewRecorder()
			r.ServeHTTP(rr, req)

			if rr.Code != http.StatusOK {
				t.Fatalf("expected 200, got %d", rr.Code)
			}

			if svc.recentLimit != tc.expected {
				t.Fatalf("expected limit %d, got %d", tc.expected, svc.recentLimit)
			}
		})
	}
}

func TestRoutes_RecentEventsReturns500OnServiceError(t *testing.T) {
	svc := &mockDashboardService{recentErr: errors.New("boom")}
	r := newRouter(svc)
	projectID := uuid.NewString()

	req := httptest.NewRequest(http.MethodGet, "/"+projectID+"/recent-events", nil)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", rr.Code)
	}
}

func TestRoutes_AreaChartDataUsesDefaultTimeRange(t *testing.T) {
	svc := &mockDashboardService{}
	r := newRouter(svc)
	projectID := uuid.NewString()

	req := httptest.NewRequest(http.MethodGet, "/"+projectID+"/area-chart-data", nil)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}

	if svc.areaTimeRange != "7d" {
		t.Fatalf("expected default time range 7d, got %s", svc.areaTimeRange)
	}
}
