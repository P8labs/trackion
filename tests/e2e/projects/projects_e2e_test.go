//go:build e2e

package projects_test

import (
	"net/http"
	"testing"
	"trackion/tests/e2e/testutil"
)

func TestProjectsCRUDAndEdgeCases(t *testing.T) {
	handler := testutil.SetupE2EApp(t)

	invalidCreate := testutil.DoRequest(t, handler, http.MethodPost, "/api/projects", map[string]any{"name": "x"}, testutil.AdminAuthHeader())
	if invalidCreate.Code != http.StatusBadRequest {
		t.Fatalf("invalid create project status=%d body=%s", invalidCreate.Code, invalidCreate.Body.String())
	}

	projectID, _ := testutil.MustCreateProject(t, handler)

	listProjects := testutil.DoRequest(t, handler, http.MethodGet, "/api/projects", nil, testutil.AdminAuthHeader())
	if listProjects.Code != http.StatusOK {
		t.Fatalf("list projects status=%d body=%s", listProjects.Code, listProjects.Body.String())
	}

	invalidProjectID := testutil.DoRequest(t, handler, http.MethodGet, "/api/projects/not-a-uuid", nil, testutil.AdminAuthHeader())
	if invalidProjectID.Code != http.StatusNotFound {
		t.Fatalf("invalid project id status=%d body=%s", invalidProjectID.Code, invalidProjectID.Body.String())
	}

	updateEdge := testutil.DoRequest(t, handler, http.MethodPut, "/api/projects/"+projectID, map[string]any{"settings": map[string]any{"unknown": true}}, testutil.AdminAuthHeader())
	if updateEdge.Code != http.StatusBadRequest {
		t.Fatalf("update edge status=%d body=%s", updateEdge.Code, updateEdge.Body.String())
	}

	updateProject := testutil.DoRequest(t, handler, http.MethodPut, "/api/projects/"+projectID, map[string]any{
		"name":    "E2E Project Updated",
		"domains": []string{"example.com", "sub.example.com"},
		"settings": map[string]any{
			"auto_pageview": false,
			"time_spent":    true,
			"campaign":      true,
			"clicks":        true,
		},
	}, testutil.AdminAuthHeader())
	if updateProject.Code != http.StatusOK {
		t.Fatalf("update project status=%d body=%s", updateProject.Code, updateProject.Body.String())
	}

	deleteProject := testutil.DoRequest(t, handler, http.MethodDelete, "/api/projects/"+projectID, nil, testutil.AdminAuthHeader())
	if deleteProject.Code != http.StatusOK {
		t.Fatalf("delete project status=%d body=%s", deleteProject.Code, deleteProject.Body.String())
	}
}
