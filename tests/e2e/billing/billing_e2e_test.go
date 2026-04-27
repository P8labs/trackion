package billing_test

import (
	"net/http"
	"testing"
	"trackion/tests/e2e/testutil"
)

func TestBillingEndpoints(t *testing.T) {
	handler := testutil.SetupE2EApp(t)

	usage := testutil.DoRequest(t, handler, http.MethodGet, "/api/billing/usage", nil, testutil.AdminAuthHeader())
	if usage.Code != http.StatusOK {
		t.Fatalf("billing usage status=%d body=%s", usage.Code, usage.Body.String())
	}

	plan := testutil.DoRequest(t, handler, http.MethodGet, "/api/billing/plan", nil, testutil.AdminAuthHeader())
	if plan.Code != http.StatusOK {
		t.Fatalf("billing plan status=%d body=%s", plan.Code, plan.Body.String())
	}
}
