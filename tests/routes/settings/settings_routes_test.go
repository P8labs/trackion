package settings_test

import (
	"testing"
	"trackion/internal/config"
	"trackion/internal/features/settings"
	"trackion/tests/routes/testutil"
)

func TestSettingsRoutes_AllAPIEndpointsRegistered(t *testing.T) {
	routes := testutil.CollectRoutes(t, settings.Routes(nil, config.Config{}))
	testutil.AssertHasRoutes(t, routes, []string{
		"GET /usage",
	})
}
