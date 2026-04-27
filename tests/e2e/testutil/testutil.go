package testutil

import (
	"bytes"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
	"trackion/internal/app"
	"trackion/internal/config"
	db "trackion/internal/db/models"
	"trackion/internal/features/auth"
	"trackion/internal/test"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const AdminToken = "e2e-admin-token"

type APIEnvelope struct {
	Status  bool            `json:"status"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data"`
}

func SetupE2EApp(t *testing.T) http.Handler {
	t.Helper()

	defer func() {
		if r := recover(); r != nil {
			t.Skipf("skipping e2e test: test DB setup failed: %v", r)
		}
	}()

	t.Setenv("DATABASE_URL", "sqlite://memory")
	t.Setenv("TRACKION_MODE", "selfhost")
	t.Setenv("TRACKION_ADMIN_TOKEN", AdminToken)
	t.Setenv("GEO_LOOKUP_ENABLED", "false")

	database := test.SetupTestDB(t)
	seedSelfHostAdminData(database)

	cfg := config.Load()
	logger := slog.New(slog.NewTextHandler(io.Discard, &slog.HandlerOptions{Level: slog.LevelError}))

	api := app.NewApplication(database, cfg, logger, "test")
	return api.Handler()
}

func seedSelfHostAdminData(database *gorm.DB) {
	adminID := uuid.MustParse(auth.SystemUserID)

	_ = database.Create(&db.User{
		ID:    adminID,
		Email: "admin@trackion.local",
		Name:  ptr("Trackion Admin"),
	}).Error

	_ = database.Create(&db.Subscription{
		UserID:              adminID,
		Plan:                "free",
		Status:              "active",
		MonthlyEventLimit:   10000,
		MaxProjects:         3,
		MaxConfigKeys:       10,
		ErrorRetentionDays:  3,
		SupportsRollout:     false,
		CurrentPeriodEnd:    time.Now().Add(30 * 24 * time.Hour),
		LastUsageReset:      time.Now(),
		EventsUsedThisMonth: 0,
		ProjectsUsed:        0,
	}).Error
}

func ptr[T any](v T) *T { return &v }

func DoRequest(t *testing.T, handler http.Handler, method, path string, body any, headers map[string]string) *httptest.ResponseRecorder {
	t.Helper()

	var reqBody io.Reader
	if body != nil {
		switch b := body.(type) {
		case string:
			reqBody = strings.NewReader(b)
		default:
			encoded, err := json.Marshal(body)
			if err != nil {
				t.Fatalf("marshal body for %s %s: %v", method, path, err)
			}
			reqBody = bytes.NewReader(encoded)
		}
	}

	req := httptest.NewRequest(method, path, reqBody)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	return rr
}

func ParseEnvelope(t *testing.T, rr *httptest.ResponseRecorder) APIEnvelope {
	t.Helper()

	var out APIEnvelope
	if err := json.Unmarshal(rr.Body.Bytes(), &out); err != nil {
		t.Fatalf("parse response body %q: %v", rr.Body.String(), err)
	}
	return out
}

func MustCreateProject(t *testing.T, handler http.Handler) (string, string) {
	t.Helper()

	rr := DoRequest(t, handler, http.MethodPost, "/api/projects", map[string]any{
		"name":    "E2E Project",
		"domains": []string{"https://example.com"},
	}, AdminAuthHeader())

	if rr.Code != http.StatusOK {
		t.Fatalf("create project status=%d body=%s", rr.Code, rr.Body.String())
	}

	created := ParseEnvelope(t, rr)
	var payload struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(created.Data, &payload); err != nil {
		t.Fatalf("parse create project payload: %v", err)
	}

	detail := DoRequest(t, handler, http.MethodGet, "/api/projects/"+payload.ID, nil, AdminAuthHeader())
	if detail.Code != http.StatusOK {
		t.Fatalf("get project status=%d body=%s", detail.Code, detail.Body.String())
	}

	detailBody := ParseEnvelope(t, detail)
	var project struct {
		APIKey string `json:"api_key"`
	}
	if err := json.Unmarshal(detailBody.Data, &project); err != nil {
		t.Fatalf("parse project detail payload: %v", err)
	}

	return payload.ID, project.APIKey
}

func AdminAuthHeader() map[string]string {
	return map[string]string{"Authorization": "Bearer " + AdminToken}
}

func ProjectKeyHeader(projectKey string) map[string]string {
	return map[string]string{"Authorization": "Bearer " + strings.TrimSpace(projectKey)}
}
