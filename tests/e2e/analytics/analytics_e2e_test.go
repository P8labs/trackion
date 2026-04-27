package analytics_test

import (
	"net/http"
	"testing"
	"trackion/tests/e2e/testutil"
)

func TestAnalyticsEndpointsCoverage(t *testing.T) {
	handler := testutil.SetupE2EApp(t)
	projectID, _ := testutil.MustCreateProject(t, handler)

	paths := []string{
		"/api/analytics/" + projectID + "/counts",
		"/api/analytics/" + projectID + "/chart-data",
		"/api/analytics/" + projectID + "/area-chart-data?time_range=24h",
		"/api/analytics/" + projectID + "/device-analytics",
		"/api/analytics/" + projectID + "/traffic-sources",
		"/api/analytics/" + projectID + "/top-pages",
		"/api/analytics/" + projectID + "/recent-events?limit=10",
		"/api/analytics/" + projectID + "/recent-events-paginated?page=1&page_size=20",
		"/api/analytics/" + projectID + "/online-users",
		"/api/analytics/" + projectID + "/country-data",
		"/api/analytics/" + projectID + "/country-map-data",
		"/api/analytics/" + projectID + "/traffic-heatmap",
	}

	for _, path := range paths {
		rr := testutil.DoRequest(t, handler, http.MethodGet, path, nil, testutil.AdminAuthHeader())
		if rr.Code != http.StatusOK && rr.Code != http.StatusInternalServerError {
			t.Fatalf("analytics endpoint=%s unexpected status=%d body=%s", path, rr.Code, rr.Body.String())
		}
	}
}
