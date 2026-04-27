package auth_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"trackion/tests/e2e/testutil"
)

func TestProtectedRoutesRequireAuth(t *testing.T) {
	handler := testutil.SetupE2EApp(t)
	projectID, _ := testutil.MustCreateProject(t, handler)

	routes := []struct {
		method string
		path   string
		body   any
	}{
		{http.MethodGet, "/api/projects", nil},
		{http.MethodPost, "/api/projects", map[string]any{"name": "unauthorized"}},
		{http.MethodGet, "/api/projects/" + projectID, nil},
		{http.MethodPut, "/api/projects/" + projectID, map[string]any{"name": "new"}},
		{http.MethodDelete, "/api/projects/" + projectID, nil},
		{http.MethodGet, "/api/runtime/projects/" + projectID + "/runtime", nil},
		{http.MethodPut, "/api/runtime/projects/" + projectID + "/runtime/flags/feature-a", map[string]any{"enabled": true, "rollout_percentage": 100}},
		{http.MethodDelete, "/api/runtime/projects/" + projectID + "/runtime/flags/feature-a", nil},
		{http.MethodPut, "/api/runtime/projects/" + projectID + "/runtime/config/theme", map[string]any{"value": map[string]any{"mode": "dark"}}},
		{http.MethodDelete, "/api/runtime/projects/" + projectID + "/runtime/config/theme", nil},
		{http.MethodGet, "/api/analytics/" + projectID + "/counts", nil},
		{http.MethodGet, "/api/replay/projects/" + projectID + "/sessions", nil},
		{http.MethodGet, "/api/errors?project_id=" + projectID, nil},
		{http.MethodGet, "/api/settings/usage", nil},
		{http.MethodGet, "/api/billing/usage", nil},
		{http.MethodGet, "/api/billing/plan", nil},
	}

	for _, tc := range routes {
		t.Run(tc.method+" "+tc.path, func(t *testing.T) {
			rr := testutil.DoRequest(t, handler, tc.method, tc.path, tc.body, nil)
			if rr.Code != http.StatusUnauthorized {
				t.Fatalf("expected 401 for %s %s, got=%d body=%s", tc.method, tc.path, rr.Code, rr.Body.String())
			}
		})
	}
}

func TestVerifyTokenEdgeCases(t *testing.T) {
	handler := testutil.SetupE2EApp(t)

	t.Run("missing token", func(t *testing.T) {
		rr := testutil.DoRequest(t, handler, http.MethodPost, "/api/auth/verify", map[string]any{}, nil)
		if rr.Code != http.StatusUnauthorized {
			t.Fatalf("verify missing token status=%d body=%s", rr.Code, rr.Body.String())
		}
	})

	t.Run("mismatch token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/auth/verify", strings.NewReader(`{"token":"body-token"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer bearer-token")

		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusUnauthorized {
			t.Fatalf("verify mismatch status=%d body=%s", rr.Code, rr.Body.String())
		}
	})

	t.Run("success", func(t *testing.T) {
		rr := testutil.DoRequest(t, handler, http.MethodPost, "/api/auth/verify", map[string]any{"token": testutil.AdminToken}, nil)
		if rr.Code != http.StatusOK {
			t.Fatalf("verify success status=%d body=%s", rr.Code, rr.Body.String())
		}
	})
}
