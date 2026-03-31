package tests

import (
	"net/http"
	"testing"
	"trackion/internal/config"
	"trackion/internal/features/auth"
	"trackion/internal/features/dashboard"
	"trackion/internal/features/events"
	"trackion/internal/features/projects"
	"trackion/internal/features/runtime"
	"trackion/internal/features/settings"

	"github.com/go-chi/chi/v5"
)

func collectRoutes(t *testing.T, router *chi.Mux) map[string]struct{} {
	t.Helper()

	routes := map[string]struct{}{}
	err := chi.Walk(router, func(method, route string, _ http.Handler, _ ...func(http.Handler) http.Handler) error {
		routes[method+" "+route] = struct{}{}
		return nil
	})
	if err != nil {
		t.Fatalf("walk routes: %v", err)
	}

	return routes
}

func assertHasRoutes(t *testing.T, got map[string]struct{}, want []string) {
	t.Helper()

	for _, route := range want {
		if _, ok := got[route]; !ok {
			t.Fatalf("missing route: %s", route)
		}
	}
}

func TestDashboardRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	routes := collectRoutes(t, dashboard.Routes(nil))
	assertHasRoutes(t, routes, []string{
		"GET /{id}/counts",
		"GET /{id}/chart-data",
		"GET /{id}/area-chart-data",
		"GET /{id}/device-analytics",
		"GET /{id}/traffic-sources",
		"GET /{id}/top-pages",
		"GET /{id}/recent-events",
		"GET /{id}/online-users",
		"GET /{id}/country-data",
	})
}

func TestProjectsRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	cfg := config.Config{
		BatchProjectRPS:   10,
		BatchProjectBurst: 20,
		BatchIPRPM:        100,
		RateLimitTTLMin:   10,
		RateLimitCleanupS: 60,
	}
	routes := collectRoutes(t, projects.Routes(nil, cfg))
	assertHasRoutes(t, routes, []string{
		"GET /",
		"POST /",
		"GET /{id}",
		"PUT /{id}",
		"DELETE /{id}",
	})
}

func TestSettingsRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	routes := collectRoutes(t, settings.Routes(nil, config.Config{}))
	assertHasRoutes(t, routes, []string{
		"GET /usage",
	})
}

func TestEventsRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	cfg := config.Config{
		BatchProjectRPS:   10,
		BatchProjectBurst: 20,
		BatchIPRPM:        100,
		RateLimitTTLMin:   10,
		RateLimitCleanupS: 60,
	}

	routes := collectRoutes(t, events.Routes(nil, cfg))
	assertHasRoutes(t, routes, []string{
		"POST /collect",
		"POST /batch",
		"GET /config",
	})
}

func TestRuntimeProtectedRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	cfg := config.Config{
		BatchProjectRPS:   10,
		BatchProjectBurst: 20,
		BatchIPRPM:        100,
		RateLimitTTLMin:   10,
		RateLimitCleanupS: 60,
	}
	routes := collectRoutes(t, runtime.Routes(nil, cfg))
	assertHasRoutes(t, routes, []string{
		"GET /projects/{id}/runtime",
		"PUT /projects/{id}/runtime/flags/{key}",
		"DELETE /projects/{id}/runtime/flags/{key}",
		"PUT /projects/{id}/runtime/config/{key}",
		"DELETE /projects/{id}/runtime/config/{key}",
	})
}

func TestAuthRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	// auth.Routes uses config.Load() which requires DATABASE_URL.
	t.Setenv("DATABASE_URL", "postgres://user:pass@localhost:5432/trackion?sslmode=disable")
	t.Setenv("TRACKION_MODE", "saas")

	routes := collectRoutes(t, auth.Routes(nil))
	assertHasRoutes(t, routes, []string{
		"GET /login/github",
		"GET /login/google",
		"GET /callback/github",
		"GET /callback/google",
		"GET /me",
		"POST /logout",
	})
}
