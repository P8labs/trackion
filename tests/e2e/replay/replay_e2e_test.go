//go:build e2e

package replay_test

import (
	"net/http"
	"testing"
	"trackion/tests/e2e/testutil"
)

func TestReplayIngestAndPrivateRoutes(t *testing.T) {
	handler := testutil.SetupE2EApp(t)
	projectID, projectKey := testutil.MustCreateProject(t, handler)

	replayInvalid := testutil.DoRequest(t, handler, http.MethodPost, "/replay", map[string]any{
		"project_key": projectKey,
		"session_id":  "sess-e2e",
		"events":      []any{},
	}, nil)
	if replayInvalid.Code != http.StatusBadRequest {
		t.Fatalf("invalid replay ingest status=%d body=%s", replayInvalid.Code, replayInvalid.Body.String())
	}

	replayOK := testutil.DoRequest(t, handler, http.MethodPost, "/replay", map[string]any{
		"project_key": projectKey,
		"session_id":  "sess-e2e",
		"events": []any{
			map[string]any{"type": "fullsnapshot", "data": map[string]any{}},
		},
	}, testutil.ProjectKeyHeader(projectKey))
	if replayOK.Code != http.StatusNoContent {
		t.Fatalf("replay ingest success status=%d body=%s", replayOK.Code, replayOK.Body.String())
	}

	replayBadLimit := testutil.DoRequest(t, handler, http.MethodGet, "/api/replay/projects/"+projectID+"/sessions?limit=nope", nil, testutil.AdminAuthHeader())
	if replayBadLimit.Code != http.StatusBadRequest {
		t.Fatalf("replay bad limit status=%d body=%s", replayBadLimit.Code, replayBadLimit.Body.String())
	}

	replayList := testutil.DoRequest(t, handler, http.MethodGet, "/api/replay/projects/"+projectID+"/sessions", nil, testutil.AdminAuthHeader())
	if replayList.Code != http.StatusOK {
		t.Fatalf("replay list status=%d body=%s", replayList.Code, replayList.Body.String())
	}

	replayGet := testutil.DoRequest(t, handler, http.MethodGet, "/api/replay/projects/"+projectID+"/sessions/sess-e2e", nil, testutil.AdminAuthHeader())
	if replayGet.Code != http.StatusOK {
		t.Fatalf("replay get status=%d body=%s", replayGet.Code, replayGet.Body.String())
	}

	replayDelete := testutil.DoRequest(t, handler, http.MethodDelete, "/api/replay/projects/"+projectID+"/sessions/sess-e2e", nil, testutil.AdminAuthHeader())
	if replayDelete.Code != http.StatusOK {
		t.Fatalf("delete replay session status=%d body=%s", replayDelete.Code, replayDelete.Body.String())
	}
}
