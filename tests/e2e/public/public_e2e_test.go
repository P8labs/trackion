//go:build e2e

package public_test

import (
	"net/http"
	"testing"
	"trackion/tests/e2e/testutil"
)

func TestPublicEndpointsBasicEdgeCases(t *testing.T) {
	handler := testutil.SetupE2EApp(t)

	health := testutil.DoRequest(t, handler, http.MethodGet, "/health", nil, nil)
	if health.Code != http.StatusOK {
		t.Fatalf("health status=%d body=%s", health.Code, health.Body.String())
	}

	collect := testutil.DoRequest(t, handler, http.MethodPost, "/events/collect", map[string]any{"event": "page.view"}, nil)
	if collect.Code != http.StatusBadRequest {
		t.Fatalf("collect missing key status=%d body=%s", collect.Code, collect.Body.String())
	}

	batch := testutil.DoRequest(t, handler, http.MethodPost, "/events/batch", map[string]any{"events": []any{}}, nil)
	if batch.Code != http.StatusBadRequest {
		t.Fatalf("batch missing key status=%d body=%s", batch.Code, batch.Body.String())
	}

	config := testutil.DoRequest(t, handler, http.MethodGet, "/events/config", nil, nil)
	if config.Code != http.StatusBadRequest {
		t.Fatalf("events config missing key status=%d body=%s", config.Code, config.Body.String())
	}

	replay := testutil.DoRequest(t, handler, http.MethodPost, "/replay", map[string]any{
		"session_id": "s1",
		"events":     []any{map[string]any{"type": "fullsnapshot"}},
	}, nil)
	if replay.Code != http.StatusUnauthorized {
		t.Fatalf("replay missing key status=%d body=%s", replay.Code, replay.Body.String())
	}

	runtime := testutil.DoRequest(t, handler, http.MethodGet, "/v1/runtime", nil, nil)
	if runtime.Code != http.StatusBadRequest {
		t.Fatalf("runtime missing key status=%d body=%s", runtime.Code, runtime.Body.String())
	}
}
