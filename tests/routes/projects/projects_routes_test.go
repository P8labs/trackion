package projects_test

import (
	"testing"
	"trackion/internal/config"
	"trackion/internal/features/projects"
	"trackion/tests/routes/testutil"
)

func TestProjectsRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	cfg := config.Config{
		BatchProjectRPS:   10,
		BatchProjectBurst: 20,
		BatchIPRPM:        100,
		RateLimitTTLMin:   10,
		RateLimitCleanupS: 60,
	}
	routes := testutil.CollectRoutes(t, projects.Routes(nil, cfg))
	testutil.AssertHasRoutes(t, routes, []string{
		"GET /",
		"POST /",
		"GET /{id}",
		"PUT /{id}",
		"DELETE /{id}",
	})
}
