//go:build e2e

package events_test

import (
	"net/http"
	"testing"
	"trackion/tests/e2e/testutil"
)

func TestEventsCollectBatchAndConfig(t *testing.T) {
	handler := testutil.SetupE2EApp(t)
	_, projectKey := testutil.MustCreateProject(t, handler)

	collectInvalid := testutil.DoRequest(t, handler, http.MethodPost, "/events/collect", map[string]any{
		"project_key": projectKey,
		"event":       "page.view",
	}, nil)
	if collectInvalid.Code != http.StatusBadRequest {
		t.Fatalf("invalid collect status=%d body=%s", collectInvalid.Code, collectInvalid.Body.String())
	}

	collectOK := testutil.DoRequest(t, handler, http.MethodPost, "/events/collect", map[string]any{
		"project_key": projectKey,
		"event":       "page.view",
		"session_id":  "session-e2e",
		"type":        "track",
		"page": map[string]any{
			"path": "/landing",
		},
	}, nil)
	if collectOK.Code != http.StatusOK {
		t.Fatalf("collect success status=%d body=%s", collectOK.Code, collectOK.Body.String())
	}

	batchInvalid := testutil.DoRequest(t, handler, http.MethodPost, "/events/batch", map[string]any{
		"project_key": projectKey,
		"events":      []any{},
	}, nil)
	if batchInvalid.Code != http.StatusBadRequest {
		t.Fatalf("invalid batch status=%d body=%s", batchInvalid.Code, batchInvalid.Body.String())
	}

	batchOK := testutil.DoRequest(t, handler, http.MethodPost, "/events/batch", map[string]any{
		"project_key": projectKey,
		"events": []any{
			map[string]any{"event": "page.view", "session_id": "session-e2e", "page": map[string]any{"path": "/pricing"}},
			map[string]any{"event": "page.click", "session_id": "session-e2e", "page": map[string]any{"path": "/pricing"}, "properties": map[string]any{"target": "cta"}},
		},
	}, nil)
	if batchOK.Code != http.StatusOK {
		t.Fatalf("batch success status=%d body=%s", batchOK.Code, batchOK.Body.String())
	}

	projectConfig := testutil.DoRequest(t, handler, http.MethodGet, "/events/config", nil, testutil.ProjectKeyHeader(projectKey))
	if projectConfig.Code != http.StatusOK {
		t.Fatalf("project config status=%d body=%s", projectConfig.Code, projectConfig.Body.String())
	}
}
