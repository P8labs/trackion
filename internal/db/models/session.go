package models

import (
	"time"

	"github.com/google/uuid"
)

func (Session) TableName() string { return "sessions" }

type Session struct {
	ID        uuid.UUID `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"column:user_id;type:uuid;not null;index" json:"user_id"`
	Token     string    `gorm:"column:token;uniqueIndex" json:"token"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	ExpiresAt time.Time `gorm:"column:expires_at" json:"expires_at"`

	User *User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
