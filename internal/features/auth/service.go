package auth

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
	"trackion/internal/config"
	"trackion/internal/core"
	"trackion/internal/db"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service interface {
	UpsertOAuthUser(ctx context.Context, provider, externalID, email, name, avatarURL string) (string, error)
	GetUser(ctx context.Context, userID string) (db.User, error)
	CreateSession(ctx context.Context, userID string) (string, error)
	DeleteSession(ctx context.Context, token string) error
	VerifyToken(ctx context.Context, token string) (db.User, error)
}

type service struct {
	db  *gorm.DB
	cfg config.Config
}

const defaultMonthlyEventLimit int = 10000

func NewService(db *gorm.DB, cfg config.Config) Service {
	return &service{
		db:  db,
		cfg: cfg,
	}
}

func (s *service) UpsertOAuthUser(ctx context.Context, provider, externalID, email, name, avatarURL string) (string, error) {
	provider = strings.ToLower(strings.TrimSpace(provider))
	externalID = strings.TrimSpace(externalID)
	email = strings.ToLower(strings.TrimSpace(email))

	if externalID == "" {
		return "", errors.New("oauth external id is required")
	}

	if email == "" {
		email = fmt.Sprintf("%s-%s@oauth.trackion.local", provider, externalID)
	}

	user, err := s.findUserByProvider(ctx, provider, externalID)
	if err == nil {
		if err := s.updateUserFromProvider(ctx, provider, externalID, email, name, avatarURL); err != nil {
			return "", err
		}

		if s.cfg.IsSaaS() {
			if err := s.ensureActiveSubscription(ctx, user.ID); err != nil {
				return "", err
			}
		}
		return user.ID.String(), nil
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return "", err
	}

	emailUser, err := gorm.G[db.User](s.db).Where("email = ?", email).First(ctx)
	if err == nil {
		if err := s.linkProviderToUser(ctx, provider, externalID, emailUser.ID); err != nil {
			return "", err
		}

		if err := s.updateUserFromProvider(ctx, provider, externalID, email, name, avatarURL); err != nil {
			return "", err
		}

		if s.cfg.IsSaaS() {
			if err := s.ensureActiveSubscription(ctx, emailUser.ID); err != nil {
				return "", err
			}
		}

		return emailUser.ID.String(), nil
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return "", err
	}

	var githubID *string
	var googleID *string
	if provider == "github" {
		githubID = core.StrPtr(externalID)
	}
	if provider == "google" {
		googleID = core.StrPtr(externalID)
	}

	u := db.User{
		GithubID:  githubID,
		GoogleID:  googleID,
		Email:     email,
		Name:      core.StrPtr(name),
		AvatarUrl: core.StrPtr(avatarURL),
	}

	err = gorm.G[db.User](s.db).Create(ctx, &u)

	if err != nil {
		return "", err
	}

	if s.cfg.IsSaaS() {
		if err := s.createDefaultSubscription(ctx, u.ID); err != nil {
			return "", err
		}
	}

	return u.ID.String(), nil
}

func (s *service) findUserByProvider(ctx context.Context, provider, externalID string) (db.User, error) {

	switch provider {
	case "github":
		return gorm.G[db.User](s.db).Where("github_id = ?", externalID).First(ctx)

	case "google":
		return gorm.G[db.User](s.db).Where("google_id = ?", externalID).First(ctx)
	default:
		return db.User{}, errors.New("unsupported oauth provider")
	}
}

func (s *service) updateUserFromProvider(ctx context.Context, provider, externalID, email, name, avatarURL string) error {
	switch provider {
	case "github":
		_, err := gorm.G[db.User](s.db).Where("github_id = ?", externalID).Updates(ctx, db.User{
			Email:     email,
			Name:      core.StrPtr(name),
			AvatarUrl: core.StrPtr(avatarURL),
			GithubID:  core.StrPtr(externalID),
		})
		return err
	case "google":
		_, err := gorm.G[db.User](s.db).Where("google_id = ?", externalID).Updates(ctx, db.User{
			Email:     email,
			Name:      core.StrPtr(name),
			AvatarUrl: core.StrPtr(avatarURL),
			GoogleID:  core.StrPtr(externalID),
		})
		return err
	default:
		return errors.New("unsupported oauth provider")
	}
}

func (s *service) linkProviderToUser(ctx context.Context, provider, externalID string, userID uuid.UUID) error {
	switch provider {
	case "github":
		_, err := gorm.G[db.User](s.db).Where("id = ?", userID).Updates(ctx, db.User{
			GithubID: core.StrPtr(externalID),
		})
		return err

	case "google":
		_, err := gorm.G[db.User](s.db).Where("id = ?", userID).Updates(ctx, db.User{
			GoogleID: core.StrPtr(externalID),
		})
		return err

	default:
		return errors.New("unsupported oauth provider")
	}
}

func (s *service) GetUser(ctx context.Context, userID string) (db.User, error) {
	return gorm.G[db.User](s.db).Where("id = ?", userID).First(ctx)
}

func (s *service) CreateSession(ctx context.Context, userID string) (string, error) {

	uid, err := uuid.Parse(userID)
	if err != nil {
		return "", err
	}

	token, err := core.GenerateSessionToken()
	if err != nil {
		return "", err
	}

	session := db.Session{
		UserID:    uid,
		Token:     token,
		ExpiresAt: time.Now().Add(30 * 24 * time.Hour),
	}

	err = gorm.G[db.Session](s.db).Create(ctx, &session)

	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *service) DeleteSession(ctx context.Context, token string) error {
	_, err := gorm.G[db.Session](s.db).Where("token = ?", token).Delete(ctx)
	return err
}

func (s *service) VerifyToken(ctx context.Context, token string) (db.User, error) {
	if s.cfg.IsSelfHost() {
		if token != s.cfg.AdminToken {
			return db.User{}, errors.New("unauthorized")
		}

		name := "Self Hosted Admin"

		return db.User{
			ID:        uuid.MustParse(SystemUserID),
			Email:     "admin@trackion.local",
			Name:      &name,
			GithubID:  nil,
			GoogleID:  nil,
			CreatedAt: time.Now(),
			AvatarUrl: nil,
		}, nil
	}

	session, err := gorm.G[db.Session](s.db).Preload("User", nil).Where("token = ? AND expires_at > ?", token, time.Now()).First(ctx)
	if err != nil {
		return db.User{}, err
	}
	return (*session.User), nil
}

func (s *service) createDefaultSubscription(ctx context.Context, userID uuid.UUID) error {
	periodEnd := time.Now().AddDate(0, 1, 0)

	sub := db.Subscription{
		UserID:            userID,
		Plan:              "free",
		MonthlyEventLimit: defaultMonthlyEventLimit,
		Status:            "active",
		CurrentPeriodEnd:  periodEnd,
	}

	err := gorm.G[db.Subscription](s.db).Create(ctx, &sub)

	return err
}

func (s *service) ensureActiveSubscription(ctx context.Context, userID uuid.UUID) error {
	subscription, err := gorm.G[db.Subscription](s.db).Where("user_id = ?", userID).First(ctx)
	if err == nil {
		if subscription.Plan == "free" {
			_, err := gorm.G[db.Subscription](s.db).
				Where("user_id = ?", userID).
				Where("status = ?", "active").
				Where("plan = ?", "free").
				Where("(current_period_end IS NULL OR current_period_end <= now())").
				Update(ctx,
					"current_period_end",
					gorm.Expr("date_trunc('month', now()) + INTERVAL '1 month'"),
				)

			if err != nil {
				return err
			}
		}
		return nil
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return s.createDefaultSubscription(ctx, userID)
	}

	return err
}
