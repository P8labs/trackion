package auth

import db "trackion/internal/db/models"

type verifyTokenRequest struct {
	Token string `json:"token"`
}

type verifyTokenResponse struct {
	Token string   `json:"token"`
	User  *db.User `json:"user,omitempty"`
}
