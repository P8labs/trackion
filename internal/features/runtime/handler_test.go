package runtime

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

type testService struct{}

func (t testService) GetPublicRuntime(_ context.Context, projectID, userID string) (PublicRuntimeDTO, error) {
	_ = projectID
	_ = userID
	return PublicRuntimeDTO{
		Flags: map[string]bool{
			"checkout_v2": true,
		},
		Config: map[string]json.RawMessage{
			"paywall.copy": json.RawMessage(`{"title":"Upgrade"}`),
		},
	}, nil
}

func (t testService) GetProjectRuntime(_ context.Context, _ string) (ProjectRuntimeDTO, error) {
	return ProjectRuntimeDTO{}, nil
}

func (t testService) UpsertFlag(_ context.Context, _, _ string, _ UpsertFlagParams) error {
	return nil
}

func (t testService) DeleteFlag(_ context.Context, _, _ string) error {
	return nil
}

func (t testService) UpsertConfig(_ context.Context, _, _ string, _ UpsertConfigParams) error {
	return nil
}

func (t testService) DeleteConfig(_ context.Context, _, _ string) error {
	return nil
}

func TestHandler_GetRuntime_ResponseShape(t *testing.T) {
	h := NewHandler(testService{})
	req := httptest.NewRequest(http.MethodGet, "/runtime?project_id=9ecf6056-f6f7-455a-952f-855111d41965&user_id=user-1", nil)
	w := httptest.NewRecorder()

	h.GetRuntime(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status code = %d, want %d", w.Code, http.StatusOK)
	}

	var body struct {
		Status bool `json:"status"`
		Data   struct {
			Flags  map[string]bool            `json:"flags"`
			Config map[string]json.RawMessage `json:"config"`
		} `json:"data"`
	}

	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("unmarshal response: %v", err)
	}

	if !body.Status {
		t.Fatalf("expected status=true")
	}

	if _, ok := body.Data.Flags["checkout_v2"]; !ok {
		t.Fatalf("expected checkout_v2 in flags")
	}

	if _, ok := body.Data.Config["paywall.copy"]; !ok {
		t.Fatalf("expected paywall.copy in config")
	}
}
