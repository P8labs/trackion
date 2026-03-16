package auth

import (
	"context"
	"time"
	"trackion/internal/core"
	"trackion/internal/repository"

	"github.com/google/uuid"
)

type Service interface {
	UpsertGithubUser(ctx context.Context, githubID, email, name string) (string, error)
	GetUser(ctx context.Context, userID string) (repository.User, error)
	CreateSession(ctx context.Context, userID string) (string, error)
	DeleteSession(ctx context.Context, token string) error
}

type service struct {
	repo repository.Querier
}

func NewService(repo repository.Querier) Service {
	return &service{
		repo: repo,
	}
}

func (s *service) UpsertGithubUser(ctx context.Context, githubID, email, name string) (string, error) {

	user, err := s.repo.GetUserByGithubId(ctx, core.StrPtr(githubID))
	if err == nil {
		return user.ID.String(), nil
	}

	u, err := s.repo.CreateUser(ctx, repository.CreateUserParams{
		ID:       uuid.New(),
		GithubID: core.StrPtr(githubID),
		Email:    email,
		Name:     core.StrPtr(name),
	})

	if err != nil {
		return "", err
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
