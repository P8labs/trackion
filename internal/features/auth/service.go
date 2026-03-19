package auth

import (
	"context"
	"errors"
	"time"
	"trackion/internal/config"
	"trackion/internal/core"
	"trackion/internal/repository"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type Service interface {
	UpsertGithubUser(ctx context.Context, githubID, email, name, avatarURL string) (string, error)
	GetUser(ctx context.Context, userID string) (repository.User, error)
	CreateSession(ctx context.Context, userID string) (string, error)
	DeleteSession(ctx context.Context, token string) error
	VerifyToken(ctx context.Context, token string) (repository.User, error)
}

type service struct {
	repo repository.Querier
	cfg  config.Config
}

const defaultMonthlyEventLimit int32 = 100000

func NewService(repo repository.Querier, cfg config.Config) Service {
	return &service{
		repo: repo,
		cfg:  cfg,
	}
}

func (s *service) UpsertGithubUser(ctx context.Context, githubID, email, name, avatarURL string) (string, error) {

	user, err := s.repo.GetUserByGithubId(ctx, core.StrPtr(githubID))
	if err == nil {
		if err := s.repo.UpdateUserFromGithub(ctx, repository.UpdateUserFromGithubParams{
			Email:     email,
			Name:      core.StrPtr(name),
			AvatarUrl: core.StrPtr(avatarURL),
			GithubID:  core.StrPtr(githubID),
		}); err != nil {
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

	u, err := s.repo.CreateUser(ctx, repository.CreateUserParams{
		ID:        uuid.New(),
		GithubID:  core.StrPtr(githubID),
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
