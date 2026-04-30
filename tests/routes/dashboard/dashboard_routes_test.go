package dashboard_test

import (
	"testing"
	"trackion/internal/features/dashboard"
	"trackion/tests/routes/testutil"
)

func TestDashboardRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	routes := testutil.CollectRoutes(t, dashboard.Routes(nil))
	testutil.AssertHasRoutes(t, routes, []string{
		"GET /{id}/counts",
		"GET /{id}/chart-data",
		"GET /{id}/device-analytics",
		"GET /{id}/traffic-sources",
		"GET /{id}/top-pages",
		"GET /{id}/recent-events",
		"GET /{id}/online-users",
	})
}
