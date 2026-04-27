package auth_test

import (
	"testing"
	"trackion/internal/config"
	"trackion/internal/features/auth"
	"trackion/tests/routes/testutil"
)

func TestAuthRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	routes := testutil.CollectRoutes(t, auth.Routes(nil, config.Config{Mode: config.ModeSaaS}))
	testutil.AssertHasRoutes(t, routes, []string{
		"GET /login/github",
		"GET /login/google",
		"GET /callback/github",
		"GET /callback/google",
		"GET /me",
		"POST /logout",
	})
}
