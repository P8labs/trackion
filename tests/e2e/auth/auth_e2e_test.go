//go:build e2e

package auth_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
	"trackion/internal/core"
	db "trackion/internal/db/models"
	"trackion/tests/e2e/testutil"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func TestAuthEmailSignupLoginAndProtectedRoutes(t *testing.T) {
	handler, database := testutil.SetupE2EAppWithDB(t)

	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/signup/email", "{", nil), http.StatusBadRequest)
	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/signup/email", map[string]any{
		"email": "missing-password@example.com",
	}, nil), http.StatusBadRequest)

	signup := testutil.DoRequest(t, handler, http.MethodPost, "/auth/signup/email", map[string]any{
		"email":    "  AUTHCASE@EXAMPLE.COM  ",
		"password": "password123",
	}, nil)
	assertStatus(t, signup, http.StatusOK)
	signupToken := parseToken(t, signup)
	if signupToken == "" {
		t.Fatalf("expected signup token")
	}

	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/signup/email", map[string]any{
		"email":    "authcase@example.com",
		"password": "password123",
	}, nil), http.StatusBadRequest)

	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/login/email", "{", nil), http.StatusBadRequest)
	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/login/email", map[string]any{
		"email": "authcase@example.com",
	}, nil), http.StatusBadRequest)
	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/login/email", map[string]any{
		"email":    "authcase@example.com",
		"password": "wrong-password",
	}, nil), http.StatusUnauthorized)
	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/login/email", map[string]any{
		"email":    "authcase@example.com",
		"password": "password123",
	}, nil), http.StatusUnauthorized)

	verifyProvider(t, database, "authcase@example.com")

	login := testutil.DoRequest(t, handler, http.MethodPost, "/auth/login/email", map[string]any{
		"email":    " AUTHCASE@example.com ",
		"password": "password123",
	}, nil)
	assertStatus(t, login, http.StatusOK)
	loginToken := parseToken(t, login)
	if loginToken == "" {
		t.Fatalf("expected login token")
	}

	assertStatus(t, testutil.DoRequest(t, handler, http.MethodGet, "/auth/me", nil, nil), http.StatusUnauthorized)
	me := testutil.DoRequest(t, handler, http.MethodGet, "/auth/me", nil, bearer(loginToken))
	assertStatus(t, me, http.StatusOK)
	if !strings.Contains(me.Body.String(), "authcase@example.com") {
		t.Fatalf("expected /auth/me response to include normalized email, body=%s", me.Body.String())
	}

	logoutByCookie := testutil.DoRequest(t, handler, http.MethodPost, "/auth/logout", nil, map[string]string{
		"Cookie": "trackion_session=" + loginToken,
	})
	assertStatus(t, logoutByCookie, http.StatusOK)
	assertStatus(t, testutil.DoRequest(t, handler, http.MethodGet, "/auth/me", nil, bearer(loginToken)), http.StatusUnauthorized)
}

func TestAuthEmailVerificationAndPasswordResetEdges(t *testing.T) {
	handler, database := testutil.SetupE2EAppWithDB(t)
	userID := createEmailUser(t, database, "verify@example.com", "oldpassword", false)
	sessionToken := createSession(t, database, userID, "session-token")

	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/email/verify", "{", bearer(sessionToken)), http.StatusBadRequest)
	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/email/verify", map[string]any{}, bearer(sessionToken)), http.StatusBadRequest)
	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/email/verify", map[string]any{
		"code": "BAD999",
	}, bearer(sessionToken)), http.StatusBadRequest)

	createVerificationCode(t, database, userID, db.EmailVerificationReason, "abc123", time.Now().Add(15*time.Minute))
	verify := testutil.DoRequest(t, handler, http.MethodPost, "/auth/email/verify", map[string]any{
		"code": " abc123 ",
	}, bearer(sessionToken))
	assertStatus(t, verify, http.StatusOK)

	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/password/reset/request?email=", nil, nil), http.StatusBadRequest)
	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/password/reset/request?email=missing@example.com", nil, nil), http.StatusInternalServerError)

	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/password/reset", "{", nil), http.StatusBadRequest)
	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/password/reset", map[string]any{
		"code": "RST123",
	}, nil), http.StatusBadRequest)
	assertStatus(t, testutil.DoRequest(t, handler, http.MethodPost, "/auth/password/reset", map[string]any{
		"code":         "RST123",
		"new_password": "newpassword",
	}, nil), http.StatusBadRequest)

	createVerificationCode(t, database, userID, db.PasswordResetReason, "rst123", time.Now().Add(15*time.Minute))
	reset := testutil.DoRequest(t, handler, http.MethodPost, "/auth/password/reset", map[string]any{
		"code":         " rst123 ",
		"new_password": "newpassword",
	}, nil)
	assertStatus(t, reset, http.StatusOK)

	loginWithNewPassword := testutil.DoRequest(t, handler, http.MethodPost, "/auth/login/email", map[string]any{
		"email":    "verify@example.com",
		"password": "newpassword",
	}, nil)
	assertStatus(t, loginWithNewPassword, http.StatusOK)
}

func parseToken(t *testing.T, rr *httptest.ResponseRecorder) string {
	t.Helper()
	var envelope testutil.APIEnvelope
	if err := json.Unmarshal(rr.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("parse auth envelope: %v", err)
	}
	var payload struct {
		Token string `json:"token"`
	}
	if err := json.Unmarshal(envelope.Data, &payload); err != nil {
		t.Fatalf("parse token payload: %v", err)
	}
	return payload.Token
}

func assertStatus(t *testing.T, rr *httptest.ResponseRecorder, want int) {
	t.Helper()
	if rr.Code != want {
		t.Fatalf("status=%d want=%d body=%s", rr.Code, want, rr.Body.String())
	}
}

func bearer(token string) map[string]string {
	return map[string]string{"Authorization": "Bearer " + token}
}

func verifyProvider(t *testing.T, database *gorm.DB, email string) {
	t.Helper()
	if err := database.Model(&db.Provider{}).
		Where("type = ? AND user_id IN (SELECT id FROM users WHERE email = ?)", db.ProviderEmail, email).
		Update("verified", true).Error; err != nil {
		t.Fatalf("verify provider: %v", err)
	}
}

func createEmailUser(t *testing.T, database *gorm.DB, email, password string, verified bool) uuid.UUID {
	t.Helper()
	user := db.User{ID: uuid.New(), Email: email}
	if err := database.Create(&user).Error; err != nil {
		t.Fatalf("create user: %v", err)
	}
	hash, err := core.HashPassword(password)
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}
	provider := db.Provider{
		ID:       uuid.New(),
		Type:     db.ProviderEmail,
		UserID:   user.ID,
		Hash:     hash,
		Verified: verified,
	}
	if err := database.Create(&provider).Error; err != nil {
		t.Fatalf("create provider: %v", err)
	}
	return user.ID
}

func createSession(t *testing.T, database *gorm.DB, userID uuid.UUID, token string) string {
	t.Helper()
	session := db.Session{
		ID:        uuid.New(),
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	if err := database.Create(&session).Error; err != nil {
		t.Fatalf("create session: %v", err)
	}
	return token
}

func createVerificationCode(t *testing.T, database *gorm.DB, userID uuid.UUID, reason, token string, expiresAt time.Time) {
	t.Helper()
	code := db.VerificationCode{
		ID:        uuid.New(),
		UserID:    userID,
		Reason:    reason,
		Token:     strings.ToUpper(strings.TrimSpace(token)),
		ExpiresAt: expiresAt,
	}
	if err := database.Create(&code).Error; err != nil {
		t.Fatalf("create verification code: %v", err)
	}
}
