//go:build e2e

package settings_test

import (
	"net/http"
	"testing"
	"trackion/tests/e2e/testutil"
)

func TestSettingsUsageEndpoint(t *testing.T) {
	handler := testutil.SetupE2EApp(t)

	rr := testutil.DoRequest(t, handler, http.MethodGet, "/api/settings/usage", nil, testutil.AdminAuthHeader())
	if rr.Code != http.StatusOK {
		t.Fatalf("settings usage status=%d body=%s", rr.Code, rr.Body.String())
	}
}
