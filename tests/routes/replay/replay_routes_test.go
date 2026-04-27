package replay_test

import (
	"testing"
	"trackion/internal/config"
	"trackion/internal/features/replay"
	"trackion/tests/routes/testutil"
)

func TestReplayRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	cfg := config.Config{
		BatchProjectRPS:   10,
		BatchProjectBurst: 20,
		BatchIPRPM:        100,
		RateLimitTTLMin:   10,
		RateLimitCleanupS: 60,
	}

	routes := testutil.CollectRoutes(t, replay.Routes(nil, cfg))
	testutil.AssertHasRoutes(t, routes, []string{
		"POST /",
	})
}

func TestReplayPrivateRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	routes := testutil.CollectRoutes(t, replay.PrivateRoutes(nil))
	testutil.AssertHasRoutes(t, routes, []string{
		"GET /projects/{id}/sessions",
		"GET /projects/{id}/sessions/{sessionId}",
		"DELETE /projects/{id}/sessions/{sessionId}",
	})
}
