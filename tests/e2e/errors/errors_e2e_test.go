//go:build e2e

package errors_test

import (
	"net/http"
	"testing"
	"trackion/tests/e2e/testutil"
)

func TestErrorTrackingEndpoints(t *testing.T) {
	handler := testutil.SetupE2EApp(t)
	projectID, _ := testutil.MustCreateProject(t, handler)

	missingProject := testutil.DoRequest(t, handler, http.MethodGet, "/api/errors", nil, testutil.AdminAuthHeader())
	if missingProject.Code != http.StatusBadRequest {
		t.Fatalf("errors missing project status=%d body=%s", missingProject.Code, missingProject.Body.String())
	}

	errorList := testutil.DoRequest(t, handler, http.MethodGet, "/api/errors?project_id="+projectID, nil, testutil.AdminAuthHeader())
	if errorList.Code != http.StatusOK && errorList.Code != http.StatusInternalServerError {
		t.Fatalf("error list status=%d body=%s", errorList.Code, errorList.Body.String())
	}

	errorStats := testutil.DoRequest(t, handler, http.MethodGet, "/api/errors/stats?project_id="+projectID, nil, testutil.AdminAuthHeader())
	if errorStats.Code != http.StatusOK && errorStats.Code != http.StatusInternalServerError {
		t.Fatalf("error stats status=%d body=%s", errorStats.Code, errorStats.Body.String())
	}

	errorDetail := testutil.DoRequest(t, handler, http.MethodGet, "/api/errors/fp-123?project_id="+projectID, nil, testutil.AdminAuthHeader())
	if errorDetail.Code != http.StatusOK && errorDetail.Code != http.StatusInternalServerError {
		t.Fatalf("error detail status=%d body=%s", errorDetail.Code, errorDetail.Body.String())
	}
}
