package auth

import (
	"context"
	"errors"
	"strings"
	"time"
	"trackion/internal/config"
	"trackion/internal/core"
	db "trackion/internal/db/models"
	"trackion/internal/repo"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	db  *gorm.DB
	cfg config.Config
}

const defaultMonthlyEventLimit int = 10000

func NewService(db *gorm.DB, cfg config.Config) *Service {
	return &Service{
		db:  db,
		cfg: cfg,
	}
}

func (s *Service) UpsertOAuthUser(ctx context.Context, provider, externalID, email, name, avatarURL string) (string, error) {

	user, err := s.FindUserByProvider(ctx, externalID)
	if err == nil {
		if err := s.UpdateUserFromProvider(ctx, externalID, email, name, avatarURL); err != nil {
			return "", err
		}

		if err := s.ensureActiveSubscription(ctx, user.ID); err != nil {
			return "", err
		}
		return user.ID.String(), nil
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return "", err
	}

	emailUser, err := gorm.G[db.User](s.db).Where(repo.User.Email.Eq(email)).First(ctx)
	if err == nil {
		if err := s.linkProviderToUser(ctx, provider, externalID, emailUser.ID); err != nil {
			return "", err
		}

		if err := s.UpdateUserFromProvider(ctx, externalID, email, name, avatarURL); err != nil {
			return "", err
		}

		if err := s.ensureActiveSubscription(ctx, emailUser.ID); err != nil {
			return "", err
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

	if err := s.createDefaultSubscription(ctx, u.ID); err != nil {
		return "", err
	}
	return u.ID.String(), nil
}

func (s *Service) FindUserByProvider(ctx context.Context, externalID string) (db.User, error) {
	return repo.Query[db.User](s.db).GetUserByProvider(ctx, externalID)
}

func (s *Service) UpdateUserFromProvider(ctx context.Context, providerId, email, name, avatarURL string) error {
	return repo.Query[db.User](s.db).UpdateUserFromProvider(ctx, providerId, email, name, avatarURL)
}

func (s *Service) linkProviderToUser(ctx context.Context, provider, externalID string, userID uuid.UUID) error {
	switch provider {
	case "github":
		_, err := gorm.G[db.User](s.db).Where(repo.User.ID.Eq(userID)).Updates(ctx, db.User{
			GithubID: core.StrPtr(externalID),
		})
		return err
	case "google":
		_, err := gorm.G[db.User](s.db).Where(repo.User.ID.Eq(userID)).Updates(ctx, db.User{
			GoogleID: core.StrPtr(externalID),
		})
		return err
	default:
		return errors.New("unsupported oauth provider")
	}
}

func (s *Service) CreateUser(ctx context.Context, email, name, avatarURL string, provider string, providerId string) (string, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if err := core.Require("email", email); err != nil {
		return "", err
	}

	u := db.User{
		Email:     email,
		Name:      core.StrPtr(name),
		AvatarUrl: core.StrPtr(avatarURL),
	}

	err := gorm.G[db.User](s.db).Create(ctx, &u)
	if err != nil {
		return "", err
	}

	if provider != "" && providerId != "" {
		if err := s.linkProviderToUser(ctx, provider, providerId, u.ID); err != nil {
			return "", err
		}
	}

	if err := s.createDefaultSubscription(ctx, u.ID); err != nil {
		return "", err
	}

	return u.ID.String(), nil
}

func (s *Service) GetUser(ctx context.Context, userID string) (db.User, error) {
	return repo.Query[db.User](s.db).GetByID(ctx, userID)
}

func (s *Service) CreateSession(ctx context.Context, userID string) (string, error) {
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

func (s *Service) DeleteSession(ctx context.Context, token string) error {
	_, err := gorm.G[db.Session](s.db).Where(repo.Session.Token.Eq(token)).Delete(ctx)
	return err
}

func (s *Service) VerifyToken(ctx context.Context, token string) (db.User, error) {
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

	session, err := gorm.G[db.Session](s.db).Preload("User", nil).
		Where(repo.Session.Token.Eq(token)).
		Where(repo.Session.ExpiresAt.Gt(time.Now())).
		First(ctx)
	if err != nil {
		return db.User{}, err
	}
	return (*session.User), nil
}

func (s *Service) createDefaultSubscription(ctx context.Context, userID uuid.UUID) error {
	if s.cfg.IsSelfHost() {
		return nil
	}

	periodEnd := time.Now().AddDate(0, 1, 0)

	sub := db.Subscription{
		UserID:            userID,
		Plan:              "free",
		MonthlyEventLimit: defaultMonthlyEventLimit,
		Status:            "active",
		CurrentPeriodEnd:  periodEnd,
	}

	return gorm.G[db.Subscription](s.db).Create(ctx, &sub)
}

func (s *Service) ensureActiveSubscription(ctx context.Context, userID uuid.UUID) error {
	if s.cfg.IsSelfHost() {
		return nil
	}

	subscription, err := gorm.G[db.Subscription](s.db).Where(repo.Subscription.UserID.Eq(userID)).First(ctx)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return s.createDefaultSubscription(ctx, userID)
	}

	if subscription.Plan == "free" {
		_, err := gorm.G[db.Subscription](s.db).
			Where(repo.Subscription.ID.Eq(userID)).
			Where(repo.Subscription.Status.Eq("active")).
			Where(repo.Subscription.Plan.Eq("free")).
			Where(repo.Subscription.CurrentPeriodEnd.IsNull()).Or(
			repo.Subscription.CurrentPeriodEnd.Lte(time.Now()),
		).
			Set(repo.Subscription.CurrentPeriodEnd.Set(time.Now().AddDate(0, 1, 0))).
			Update(ctx)
		if err != nil {
			return err
		}
	}

	return nil
}
