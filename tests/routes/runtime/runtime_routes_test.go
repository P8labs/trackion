package runtime_test

import (
	"testing"
	"trackion/internal/config"
	"trackion/internal/features/runtime"
	"trackion/tests/routes/testutil"
)

func TestRuntimeProtectedRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	cfg := config.Config{
		BatchProjectRPS:   10,
		BatchProjectBurst: 20,
		BatchIPRPM:        100,
		RateLimitTTLMin:   10,
		RateLimitCleanupS: 60,
	}
	routes := testutil.CollectRoutes(t, runtime.Routes(nil, cfg))
	testutil.AssertHasRoutes(t, routes, []string{
		"GET /projects/{id}/runtime",
		"PUT /projects/{id}/runtime/flags/{key}",
		"DELETE /projects/{id}/runtime/flags/{key}",
		"PUT /projects/{id}/runtime/config/{key}",
		"DELETE /projects/{id}/runtime/config/{key}",
	})
}
