package models

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

func (User) TableName() string { return "users" }

type User struct {
	ID    uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email string    `gorm:"column:email;unique" json:"email"`

	AvatarUrl *string `gorm:"column:avatar_url" json:"avatar_url,omitempty"`
	Name      *string `gorm:"column:name" json:"name,omitempty"`

	CreatedAt     time.Time  `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     time.Time  `gorm:"column:updated_at" json:"updated_at"`
	EmailAttempts int        `gorm:"column:email_attempts" json:"email_attempts"`
	LastEmailSent *time.Time `gorm:"column:last_email_sent" json:"last_email_sent,omitempty"`

	Subscription Subscription `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"subscription"`
	Sessions     []Session    `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"sessions,omitempty"`
	Projects     []Project    `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"projects,omitempty"`
	Providers    []Provider   `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"providers,omitempty"`
}

const (
	ProviderGithub = "github"
	ProviderGoogle = "google"
	ProviderEmail  = "email"
)

type Provider struct {
	ID         uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Type       string    `gorm:"column:type" json:"type"`
	Scope      *string   `gorm:"column:scope" json:"scope,omitempty"`
	ProviderID *string   `gorm:"column:provider_id" json:"provider_id,omitempty"`
	UserID     uuid.UUID `gorm:"column:user_id;unique" json:"user_id"`
	Hash       string    `gorm:"column:hash" json:"-"`
	Verified   bool      `gorm:"column:verified" json:"verified"`
	CreatedAt  time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt  time.Time `gorm:"column:updated_at" json:"updated_at"`

	User User `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}

type EmailReason string

const (
	EmailVerificationReason EmailReason = "email_verification"
	PasswordResetReason     EmailReason = "password_reset"
	AccountDeletionReason   EmailReason = "account_deletion"
)

type VerificationCode struct {
	ID        uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"column:user_id" json:"user_id"`
	Reason    string    `gorm:"column:reason" json:"reason"`
	Token     string    `gorm:"column:token;unique" json:"code"`
	ExpiresAt time.Time `gorm:"column:expires_at" json:"expires_at"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`

	User User `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}

func ParseVerificationReason(r string) (string, error) {
	switch r {
	case string(EmailVerificationReason), string(PasswordResetReason), string(AccountDeletionReason):
		return r, nil
	default:
		return "", errors.New("invalid verification reason")
	}
}

func ParseProvider(p string) (string, error) {
	switch p {
	case "github":
		return ProviderGithub, nil
	case "google":
		return ProviderGoogle, nil
	case "email":
		return ProviderEmail, nil
	default:
		return "", errors.New("invalid provider type")
	}
}
