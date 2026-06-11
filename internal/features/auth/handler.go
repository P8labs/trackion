package auth

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"trackion/internal/config"
	"trackion/internal/core"
	db "trackion/internal/db/models"
	"trackion/internal/res"

	"github.com/markbates/goth/gothic"
)

type handler struct {
	service *Service
	cfg     config.Config
}

func NewHandler(service *Service, cfg config.Config) *handler {
	return &handler{
		service,
		cfg,
	}
}

func (h *handler) GithubLogin(w http.ResponseWriter, r *http.Request) {
	h.oauthLogin(w, r, "github")
}

func (h *handler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	h.oauthLogin(w, r, "google")
}

func (h *handler) oauthLogin(w http.ResponseWriter, r *http.Request, provider string) {
	client := r.URL.Query().Get("client")
	if client == "" {
		client = "web"
	}

	state, err := core.GenerateAuthStateCode(client, h.cfg.AuthSecret)
	if err != nil {
		res.Error(w, "state generation failed", 500)
		return
	}

	q := r.URL.Query()
	q.Set("state", state)
	q.Set("provider", provider)
	r.URL.RawQuery = q.Encode()
	gothic.BeginAuthHandler(w, r)
}

func (h *handler) GithubCallback(w http.ResponseWriter, r *http.Request) {
	h.oauthCallback(w, r, "github")
}

func (h *handler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	h.oauthCallback(w, r, "google")
}

func (h *handler) oauthCallback(w http.ResponseWriter, r *http.Request, provider string) {

	state := r.URL.Query().Get("state")
	client, err := core.ParseAuthStateCode(state, h.cfg.AuthSecret)
	if err != nil {
		errUrl := fmt.Sprintf("%s/auth/callback?error=invalid_state", h.cfg.FrontendURL)
		http.Redirect(w, r, errUrl, http.StatusTemporaryRedirect)
		return
	}

	q := r.URL.Query()
	q.Set("provider", provider)
	r.URL.RawQuery = q.Encode()

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		log.Printf("OAuth callback error: %v", err)
		errUrl := fmt.Sprintf("%s/auth/callback?error=oauth_failed", h.cfg.FrontendURL)
		http.Redirect(w, r, errUrl, http.StatusTemporaryRedirect)
		return
	}

	ctx := r.Context()

	providerId := strings.TrimSpace(user.UserID)
	provider = strings.ToLower(strings.TrimSpace(provider))
	email := strings.ToLower(strings.TrimSpace(user.Email))

	if err := core.Require("providerId", providerId, "email", email); err != nil {
		errUrl := fmt.Sprintf("%s/auth/callback?error=missing_fields", h.cfg.FrontendURL)
		http.Redirect(w, r, errUrl, http.StatusTemporaryRedirect)
		return
	}

	userID, err := h.service.SignInWithOAuth(
		ctx,
		provider,
		providerId,
		user.Email,
		user.Name,
		user.AvatarURL,
	)

	if err != nil {
		errUrl := fmt.Sprintf("%s/auth/callback?error=user_creation_failed", h.cfg.FrontendURL)
		http.Redirect(w, r, errUrl, http.StatusTemporaryRedirect)
		return
	}

	sessionToken, err := h.service.CreateSession(ctx, userID)
	if err != nil {
		errUrl := fmt.Sprintf("%s/auth/callback?error=session_creation_failed", h.cfg.FrontendURL)
		http.Redirect(w, r, errUrl, http.StatusTemporaryRedirect)
		return
	}

	if client == "desktop" || client == "mobile" {
		redirect := fmt.Sprintf(
			"trackion://auth?token=%s&auth=%s",
			sessionToken,
			provider,
		)

		http.Redirect(w, r, redirect, http.StatusTemporaryRedirect)
		return
	}

	redirect := fmt.Sprintf(
		"%s/auth/callback?token=%s&auth=%s",
		h.cfg.FrontendURL,
		sessionToken,
		provider,
	)

	http.Redirect(w, r, redirect, http.StatusTemporaryRedirect)
}

func (h *handler) EmailLogin(w http.ResponseWriter, r *http.Request) {
	payload, err := res.Parse[EmailAuthRequest](r)

	if err != nil {
		res.Error(w, "invalid request body", 400)
		return
	}

	if err := core.Require("email", payload.Email, "password", payload.Password); err != nil {
		res.Error(w, "email and password are required", 400)
		return
	}

	userID, err := h.service.SignInWithEmail(r.Context(), payload.Email, payload.Password)
	if err != nil {
		res.Error(w, "invalid email or password", 401)
		return
	}

	sessionToken, err := h.service.CreateSession(r.Context(), userID)
	if err != nil {
		res.Error(w, "session creation failed", 500)
		return
	}

	res.Success(w, TokenResponse{
		Token: sessionToken,
	}, "Login successful")
}

func (h *handler) EmailSignUp(w http.ResponseWriter, r *http.Request) {

	payload, err := res.Parse[EmailAuthRequest](r)

	if err != nil {
		res.Error(w, "invalid request body", 400)
		return
	}

	if err := core.Require("email", payload.Email, "password", payload.Password); err != nil {
		res.Error(w, "email and password are required", 400)
		return
	}

	userID, err := h.service.SignUpWithEmail(r.Context(), payload.Email, payload.Password)
	if err != nil {
		res.Error(w, err.Error(), 400)
		return
	}

	sessionToken, err := h.service.CreateSession(r.Context(), userID)
	if err != nil {
		res.Error(w, "session creation failed", 500)
		return
	}

	res.Success(w, TokenResponse{
		Token: sessionToken,
	}, "Signup successful")
}

func (h *handler) VerifyEmail(w http.ResponseWriter, r *http.Request) {

	payload, err := res.Parse[VerifyEmailRequest](r)

	if err != nil {
		res.Error(w, "invalid request body", 400)
		return
	}

	code := strings.TrimSpace(payload.Code)

	if err := core.Require("code", code); err != nil {
		res.Error(w, "code is required", 400)
		return
	}

	_, err = h.service.VerifyEmailCode(r.Context(), strings.ToUpper(code))
	if err != nil {
		res.Error(w, "invalid or expired verification code", 400)
		return
	}

	res.Success(w, res.M{}, "Email verified and logged in")
}

func (h *handler) SendEmailVerification(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userId := ctx.Value(UserIdContextKey)

	user, err := h.service.GetUser(r.Context(), userId.(string))
	if err != nil {
		res.Error(w, "user not found", 404)
		return
	}

	email := user.Email
	if email == "" {
		res.Error(w, "email is required", 400)
		return
	}

	err = h.service.SendVerificationEmail(r.Context(), email, db.EmailVerificationReason)
	if err != nil {
		res.Error(w, "failed to resend verification code", 500)
		return
	}

	res.Success(w, res.M{}, "Verification code resent if email exists")
}

func (h *handler) SendPasswordResetEmail(w http.ResponseWriter, r *http.Request) {

	email := r.URL.Query().Get("email")
	email = strings.ToLower(strings.TrimSpace(email))

	if email == "" {
		res.Error(w, "email is required", 400)
		return
	}

	err := h.service.SendVerificationEmail(r.Context(), email, db.PasswordResetReason)
	if err != nil {
		res.Error(w, "failed to send password reset email", 500)
		return
	}

	res.Success(w, res.M{}, "Password reset email sent if email exists")
}

func (h *handler) ResetPassword(w http.ResponseWriter, r *http.Request) {

	payload, err := res.Parse[ResetPasswordRequest](r)

	if err != nil {
		res.Error(w, "invalid request body", 400)
		return
	}

	code := strings.TrimSpace(payload.Code)
	newPassword := payload.NewPassword

	if err := core.Require("code", code, "new_password", newPassword); err != nil {
		res.Error(w, "code and new password are required", 400)
		return
	}

	err = h.service.PasswordReset(r.Context(), strings.ToUpper(code), newPassword)
	if err != nil {
		res.Error(w, "invalid or expired verification code", 400)
		return
	}

	res.Success(w, res.M{}, "Password reset successful")
}

func (h *handler) Me(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value(UserIdContextKey).(string)
	if !ok {
		res.Error(w, "unauthorized", 401)
		return
	}

	user, err := h.service.GetUser(r.Context(), userID)
	if err != nil {
		res.Error(w, "user not found", 404)
		return
	}

	res.Success(w, user, "User Details")
}

func (h *handler) Logout(w http.ResponseWriter, r *http.Request) {

	token := core.ExtractBearer(r)

	if token == "" {
		cookie, err := r.Cookie("trackion_session")
		if err == nil {
			token = cookie.Value
		}
	}

	if token != "" {
		_ = h.service.DeleteSession(r.Context(), token)
	}

	http.SetCookie(w, &http.Cookie{
		Name:   "trackion_session",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})

	w.WriteHeader(200)
}
