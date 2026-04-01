package auth

import (
	"fmt"
	"net/http"
	"strings"
	"trackion/internal/config"
	"trackion/internal/core"
	"trackion/internal/db"
	"trackion/internal/res"

	"github.com/markbates/goth/gothic"
)

type handler struct {
	service Service
	cfg     config.Config
}

func NewHandler(service Service, cfg config.Config) *handler {
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
		res.Error(w, "invalid oauth state", 401)
		return
	}

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		res.Error(w, "oauth failed", 401)
		return
	}

	ctx := r.Context()

	userID, err := h.service.UpsertOAuthUser(
		ctx,
		provider,
		user.UserID,
		user.Email,
		user.Name,
		user.AvatarURL,
	)

	if err != nil {
		res.Error(w, "user creation failed", 500)
		return
	}

	sessionToken, err := h.service.CreateSession(ctx, userID)
	if err != nil {
		res.Error(w, "session creation failed", 500)
		return
	}

	if client == "desktop" {
		// Added because I want to build a desktop app also. But let's see when
		redirect := fmt.Sprintf(
			"trackion://auth?token=%s",
			sessionToken,
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

	token := extractBearer(r)

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

type verifyTokenRequest struct {
	Token string `json:"token"`
}

type verifyTokenResponse struct {
	Token string   `json:"token"`
	User  *db.User `json:"user,omitempty"`
}

func (h *handler) VerifyToken(w http.ResponseWriter, r *http.Request) {
	payload, err := res.Parse[verifyTokenRequest](r)
	if err != nil {
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	bodyToken := strings.TrimSpace(payload.Token)
	bearerToken := strings.TrimSpace(extractBearer(r))

	token := bodyToken
	if token == "" {
		token = bearerToken
	}

	if token == "" {
		res.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if bodyToken != "" && bearerToken != "" && bodyToken != bearerToken {
		res.Error(w, "token mismatch", http.StatusUnauthorized)
		return
	}

	user, err := h.service.VerifyToken(r.Context(), token)
	if err != nil {
		res.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	res.Success(w, verifyTokenResponse{
		Token: token,
		User:  &user,
	}, "Token verified")
}
