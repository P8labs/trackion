package auth_test

import (
	"testing"
	"trackion/internal/test"
	"trackion/tests/routes/testutil"

	"github.com/go-chi/chi/v5"
)

func TestAuthRoutes_AllEndpointsRegistered(t *testing.T) {
	handler := test.NewTestApp(t)
	router, ok := handler.(chi.Routes)
	if !ok {
		t.Fatalf("test app handler does not expose chi routes")
	}

	routes := testutil.CollectRoutes(t, router)
	testutil.AssertHasRoutes(t, routes, []string{
		"GET /auth/login/github",
		"GET /auth/login/google",
		"POST /auth/login/email",
		"POST /auth/signup/email",
		"POST /auth/password/reset/request",
		"POST /auth/password/reset",
		"GET /auth/callback/github",
		"GET /auth/callback/google",
		"POST /auth/email/verify",
		"POST /auth/email/verify/request",
		"POST /auth/logout",
		"GET /auth/me",
	})
}
