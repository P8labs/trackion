package events_test

import (
	"testing"
	"trackion/internal/config"
	"trackion/internal/features/events"
	"trackion/tests/routes/testutil"
)

func TestEventsRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	cfg := config.Config{
		BatchProjectRPS:   10,
		BatchProjectBurst: 20,
		BatchIPRPM:        100,
		RateLimitTTLMin:   10,
		RateLimitCleanupS: 60,
	}

	routes := testutil.CollectRoutes(t, events.Routes(nil, cfg))
	testutil.AssertHasRoutes(t, routes, []string{
		"POST /collect",
		"POST /batch",
		"GET /config",
	})
}
