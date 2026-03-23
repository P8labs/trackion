package auth

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
	"trackion/internal/config"
	"trackion/internal/core"
	"trackion/internal/repository"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type Service interface {
	UpsertOAuthUser(ctx context.Context, provider, externalID, email, name, avatarURL string) (string, error)
	GetUser(ctx context.Context, userID string) (repository.User, error)
	CreateSession(ctx context.Context, userID string) (string, error)
	DeleteSession(ctx context.Context, token string) error
	VerifyToken(ctx context.Context, token string) (repository.User, error)
}

type service struct {
	repo repository.Querier
	cfg  config.Config
}

const defaultMonthlyEventLimit int32 = 10000

func NewService(repo repository.Querier, cfg config.Config) Service {
	return &service{
		repo: repo,
		cfg:  cfg,
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

	if !errors.Is(err, pgx.ErrNoRows) {
		return "", err
	}

	emailUser, err := s.repo.GetUserByEmail(ctx, email)
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

	if !errors.Is(err, pgx.ErrNoRows) {
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

	u, err := s.repo.CreateUser(ctx, repository.CreateUserParams{
		ID:        uuid.New(),
		GithubID:  githubID,
		GoogleID:  googleID,
		Email:     email,
		Name:      core.StrPtr(name),
		AvatarUrl: core.StrPtr(avatarURL),
	})

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

func (s *service) findUserByProvider(ctx context.Context, provider, externalID string) (repository.User, error) {
	switch provider {
	case "github":
		return s.repo.GetUserByGithubId(ctx, core.StrPtr(externalID))
	case "google":
		return s.repo.GetUserByGoogleId(ctx, core.StrPtr(externalID))
	default:
		return repository.User{}, errors.New("unsupported oauth provider")
	}
}

func (s *service) updateUserFromProvider(ctx context.Context, provider, externalID, email, name, avatarURL string) error {
	switch provider {
	case "github":
		return s.repo.UpdateUserFromGithub(ctx, repository.UpdateUserFromGithubParams{
			Email:     email,
			Name:      core.StrPtr(name),
			AvatarUrl: core.StrPtr(avatarURL),
			GithubID:  core.StrPtr(externalID),
		})
	case "google":
		return s.repo.UpdateUserFromGoogle(ctx, repository.UpdateUserFromGoogleParams{
			Email:     email,
			Name:      core.StrPtr(name),
			AvatarUrl: core.StrPtr(avatarURL),
			GoogleID:  core.StrPtr(externalID),
		})
	default:
		return errors.New("unsupported oauth provider")
	}
}

func (s *service) linkProviderToUser(ctx context.Context, provider, externalID string, userID uuid.UUID) error {
	switch provider {
	case "github":
		return s.repo.LinkGithubIDToUser(ctx, repository.LinkGithubIDToUserParams{
			GithubID: core.StrPtr(externalID),
			ID:       userID,
		})
	case "google":
		return s.repo.LinkGoogleIDToUser(ctx, repository.LinkGoogleIDToUserParams{
			GoogleID: core.StrPtr(externalID),
			ID:       userID,
		})
	default:
		return errors.New("unsupported oauth provider")
	}
}

func (s *service) GetUser(ctx context.Context, userID string) (repository.User, error) {
	return s.repo.GetUser(ctx, uuid.MustParse(userID))
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

	_, err = s.repo.CreateSession(ctx, repository.CreateSessionParams{
		ID:        uuid.New(),
		UserID:    uid,
		Token:     token,
		ExpiresAt: time.Now().Add(30 * 24 * time.Hour),
	})

	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *service) DeleteSession(ctx context.Context, token string) error {
	return s.repo.DeleteSession(ctx, token)
}

func (s *service) VerifyToken(ctx context.Context, token string) (repository.User, error) {
	if s.cfg.IsSelfHost() {
		if token != s.cfg.AdminToken {
			return repository.User{}, errors.New("unauthorized")
		}

		name := "Self Hosted Admin"

		return repository.User{
			ID:        uuid.MustParse(SystemUserID),
			Email:     "admin@trackion.local",
			Name:      &name,
			GithubID:  nil,
			GoogleID:  nil,
			CreatedAt: time.Now(),
			AvatarUrl: nil,
		}, nil
	}

	session, err := s.repo.GetSessionByToken(ctx, token)
	if err != nil {
		return repository.User{}, err
	}

	return s.repo.GetUser(ctx, session.UserID)
}

func (s *service) createDefaultSubscription(ctx context.Context, userID uuid.UUID) error {
	periodEnd := time.Now().AddDate(0, 1, 0)

	_, err := s.repo.CreateSubscription(ctx, repository.CreateSubscriptionParams{
		ID:                uuid.New(),
		UserID:            userID,
		Plan:              "free",
		MonthlyEventLimit: defaultMonthlyEventLimit,
		Status:            "active",
		CurrentPeriodEnd: pgtype.Timestamptz{
			Time:  periodEnd,
			Valid: true,
		},
	})

	return err
}

func (s *service) ensureActiveSubscription(ctx context.Context, userID uuid.UUID) error {
	subscription, err := s.repo.GetActiveSubscriptionByUser(ctx, userID)
	if err == nil {
		if subscription.Plan == "free" {
			if err := s.repo.RenewUserFreeSubscriptionIfNeeded(ctx, userID); err != nil {
				return err
			}
		}
		return nil
	}

	if errors.Is(err, pgx.ErrNoRows) {
		return s.createDefaultSubscription(ctx, userID)
	}

	return err
}
