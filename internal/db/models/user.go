package models

import (
	"time"

	"github.com/google/uuid"
)

func (User) TableName() string { return "users" }

type User struct {
	ID        uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	AvatarUrl *string   `gorm:"column:avatar_url" json:"avatar_url,omitempty"`
	Email     string    `gorm:"column:email;unique" json:"email"`
	Name      *string   `gorm:"column:name" json:"name,omitempty"`
	GithubID  *string   `gorm:"column:github_id;unique" json:"github_id,omitempty"`
	GoogleID  *string   `gorm:"column:google_id;unique" json:"google_id,omitempty"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`

	Subscription Subscription `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Sessions     []Session    `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Projects     []Project    `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}
