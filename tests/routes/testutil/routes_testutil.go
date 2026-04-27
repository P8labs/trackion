package testutil

import (
	"net/http"
	"testing"

	"github.com/go-chi/chi/v5"
)

func CollectRoutes(t *testing.T, router *chi.Mux) map[string]struct{} {
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

func AssertHasRoutes(t *testing.T, got map[string]struct{}, want []string) {
	t.Helper()

	for _, route := range want {
		if _, ok := got[route]; !ok {
			t.Fatalf("missing route: %s", route)
		}
	}
}
