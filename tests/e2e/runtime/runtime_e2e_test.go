//go:build e2e

package runtime_test

import (
	"net/http"
	"testing"
	"trackion/tests/e2e/testutil"
)

func TestRuntimePublicAndPrivateRoutes(t *testing.T) {
	handler := testutil.SetupE2EApp(t)
	projectID, projectKey := testutil.MustCreateProject(t, handler)

	runtimePublic := testutil.DoRequest(t, handler, http.MethodGet, "/v1/runtime?user_id=user-1", nil, testutil.ProjectKeyHeader(projectKey))
	if runtimePublic.Code != http.StatusOK {
		t.Fatalf("public runtime status=%d body=%s", runtimePublic.Code, runtimePublic.Body.String())
	}

	runtimeGet := testutil.DoRequest(t, handler, http.MethodGet, "/api/runtime/projects/"+projectID+"/runtime", nil, testutil.AdminAuthHeader())
	if runtimeGet.Code != http.StatusOK {
		t.Fatalf("runtime get status=%d body=%s", runtimeGet.Code, runtimeGet.Body.String())
	}

	flagBad := testutil.DoRequest(t, handler, http.MethodPut, "/api/runtime/projects/"+projectID+"/runtime/flags/beta", map[string]any{
		"enabled":            true,
		"rollout_percentage": 101,
	}, testutil.AdminAuthHeader())
	if flagBad.Code != http.StatusBadRequest {
		t.Fatalf("flag bad status=%d body=%s", flagBad.Code, flagBad.Body.String())
	}

	flagUpsert := testutil.DoRequest(t, handler, http.MethodPut, "/api/runtime/projects/"+projectID+"/runtime/flags/beta", map[string]any{
		"enabled":            true,
		"rollout_percentage": 100,
	}, testutil.AdminAuthHeader())
	if flagUpsert.Code != http.StatusOK {
		t.Fatalf("flag upsert status=%d body=%s", flagUpsert.Code, flagUpsert.Body.String())
	}

	configBad := testutil.DoRequest(t, handler, http.MethodPut, "/api/runtime/projects/"+projectID+"/runtime/config/theme", map[string]any{}, testutil.AdminAuthHeader())
	if configBad.Code != http.StatusBadRequest {
		t.Fatalf("config bad status=%d body=%s", configBad.Code, configBad.Body.String())
	}

	configUpsert := testutil.DoRequest(t, handler, http.MethodPut, "/api/runtime/projects/"+projectID+"/runtime/config/theme", map[string]any{
		"value": map[string]any{"primary": "blue"},
	}, testutil.AdminAuthHeader())
	if configUpsert.Code != http.StatusOK {
		t.Fatalf("config upsert status=%d body=%s", configUpsert.Code, configUpsert.Body.String())
	}

	configDelete := testutil.DoRequest(t, handler, http.MethodDelete, "/api/runtime/projects/"+projectID+"/runtime/config/theme", nil, testutil.AdminAuthHeader())
	if configDelete.Code != http.StatusOK {
		t.Fatalf("config delete status=%d body=%s", configDelete.Code, configDelete.Body.String())
	}

	flagDelete := testutil.DoRequest(t, handler, http.MethodDelete, "/api/runtime/projects/"+projectID+"/runtime/flags/beta", nil, testutil.AdminAuthHeader())
	if flagDelete.Code != http.StatusOK {
		t.Fatalf("flag delete status=%d body=%s", flagDelete.Code, flagDelete.Body.String())
	}
}
