package auth

import (
	"fmt"
	"net/http"
	"trackion/internal/config"
	"trackion/internal/core"
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
	q.Set("provider", "github")
	r.URL.RawQuery = q.Encode()

	gothic.BeginAuthHandler(w, r)
}

func (h *handler) GithubCallback(w http.ResponseWriter, r *http.Request) {

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

	userID, err := h.service.UpsertGithubUser(
		ctx,
		user.UserID,
		user.Email,
		user.Name,
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

		redirect := fmt.Sprintf(
			"trackion://auth?token=%s",
			sessionToken,
		)

		http.Redirect(w, r, redirect, http.StatusTemporaryRedirect)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "trackion_session",
		Value:    sessionToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
	})

	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
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

	res.SuccessRaw(w, user)
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
