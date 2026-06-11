package auth

type TokenResponse struct {
	Token string `json:"token"`
}

type EmailAuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type VerifyEmailRequest struct {
	Code string `json:"code"`
}

type ResetPasswordRequest struct {
	Code        string `json:"token"`
	NewPassword string `json:"new_password"`
}

type UserResponse struct {
	ID        string  `json:"id"`
	Email     string  `json:"email"`
	Name      *string `json:"name,omitempty"`
	AvatarUrl *string `json:"avatar_url,omitempty"`

	IsEmailVerified      bool `json:"is_email_verified"`
	IsActiveSubscription bool `json:"is_active_subscription"`

	SubscriptionPlan string         `json:"subscription_plan"`
	EndsAt           string         `json:"subscription_ends_at"`
	Providers        []UserProvider `json:"providers"`
	CreatedAt        string         `json:"created_at"`
	UpdatedAt        string         `json:"updated_at"`
}

type UserProvider struct {
	Type      string `json:"type"`
	Verified  bool   `json:"verified"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}
