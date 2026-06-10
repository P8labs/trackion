package auth

import (
	"context"
	"errors"
	"log"
	"strings"
	"time"
	"trackion/internal/config"
	"trackion/internal/core"
	db "trackion/internal/db/models"
	"trackion/internal/features/mail"
	"trackion/internal/repo"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	db   *gorm.DB
	cfg  config.Config
	mail *mail.Service
}

const defaultMonthlyEventLimit int = 10000

func NewService(db *gorm.DB, cfg config.Config) *Service {
	return &Service{
		db:   db,
		cfg:  cfg,
		mail: mail.NewService(cfg),
	}
}

func (s *Service) SignUpWithEmail(ctx context.Context, email, password string) (string, error) {
	email = strings.ToLower(strings.TrimSpace(email))

	if err := core.Require("email", email, "password", password); err != nil {
		return "", err
	}

	hashedPassword, err := core.HashPassword(password)
	if err != nil {
		return "", err
	}

	provider := db.Provider{
		Type:     db.ProviderEmail,
		Hash:     hashedPassword,
		Verified: false,
		User: db.User{
			Email: email,
		},
	}

	err = gorm.G[db.Provider](s.db).Create(ctx, &provider)
	if err != nil {
		return "", err
	}

	return provider.User.ID.String(), nil
}

func (s *Service) SignInWithEmail(ctx context.Context, email, password string) (string, error) {
	email = strings.ToLower(strings.TrimSpace(email))

	if err := core.Require("email", email, "password", password); err != nil {
		return "", err
	}

	provider, err := gorm.G[db.Provider](s.db).Preload("users", func(db gorm.PreloadBuilder) error {
		db.Where(repo.User.Email.Eq(email))
		return nil
	}).Where("type = ?", db.ProviderEmail).First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", errors.New("invalid email or password")
		}
		return "", err
	}

	if provider.Verified == false {
		return "", errors.New("email not verified")
	}

	if !core.CheckPasswordHash(password, provider.Hash) {
		return "", errors.New("invalid email or password")
	}

	return provider.UserID.String(), nil
}

func (s *Service) SendVerificationEmail(ctx context.Context, reason, email string) error {
	email = strings.ToLower(strings.TrimSpace(email))

	if err := core.Require("email", email); err != nil {
		return err
	}

	if _, err := db.ParseVerificationReason(reason); err != nil {
		return err
	}

	provider, err := gorm.G[db.Provider](s.db).Preload("users", func(db gorm.PreloadBuilder) error {
		db.Where(repo.User.Email.Eq(email))
		return nil
	}).Where("type = ?", db.ProviderEmail).First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("email not found")
		}
		return err
	}

	if provider.UserID == uuid.Nil {
		return errors.New("associated user not found")
	}

	if provider.User.Email != email {
		return errors.New("email mismatch")
	}

	// if attempts are more than 3 and last email sent is less than 24hrs then block for 24hrs,
	// if last email sent is more than 24hrs then reset attempts,
	// if attempts are more than 3 but last email sent is more than 15 mins then allow but show warning of too many attempts
	if provider.User.EmailAttempts >= 3 {
		if provider.User.LastEmailSent != nil {
			elapsed := time.Since(*provider.User.LastEmailSent)
			switch {
			case elapsed > 24*time.Hour:
				provider.User.EmailAttempts = 0

			case elapsed > 15*time.Minute:
				log.Println("warning: too many email attempts")

			default:
				return errors.New("too many attempts, please try again later")
			}
		}
	}

	provider.User.EmailAttempts++
	now := time.Now()
	provider.User.LastEmailSent = &now

	if _, err := gorm.G[db.User](s.db).Where(repo.User.ID.Eq(provider.UserID)).Updates(ctx, provider.User); err != nil {
		return err
	}

	code, err := core.GenerateRandomCode(6)
	if err != nil {
		return err
	}

	verification := db.VerificationCode{
		UserID:    provider.UserID,
		Code:      strings.ToUpper(code),
		ExpiresAt: time.Now().Add(15 * time.Minute),
		Reason:    reason,
	}

	err = gorm.G[db.VerificationCode](s.db).Create(ctx, &verification)
	if err != nil {
		return err
	}

	err = s.mail.SendEmailVerification(email, reason, code)
	if err != nil {
		return err
	}
	return nil

}

func (s *Service) PasswordReset(ctx context.Context, email, code, newPassword string) error {
	email = strings.ToLower(strings.TrimSpace(email))
	code = strings.TrimSpace(code)

	if err := core.Require("email", email, "code", code, "new_password", newPassword); err != nil {
		return err
	}

	provider, err := gorm.G[db.Provider](s.db).Preload("users", func(db gorm.PreloadBuilder) error {
		db.Where(repo.User.Email.Eq(email))
		return nil
	}).Where("type = ?", db.ProviderEmail).First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("invalid email or code")
		}
		return err
	}

	if provider.UserID == uuid.Nil {
		return errors.New("associated user not found")
	}

	if provider.User.Email != email {
		return errors.New("email mismatch")
	}

	v, err := gorm.G[db.VerificationCode](s.db).Where(repo.VerificationCode.UserID.Eq(provider.UserID)).Where(repo.VerificationCode.Code.Eq(code)).Where(repo.VerificationCode.ExpiresAt.Gte(time.Now())).First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("invalid email or code")
		}
		return err
	}

	if v.Reason != db.PasswordResetReason {
		return errors.New("invalid verification code")
	}

	hashedPassword, err := core.HashPassword(newPassword)
	if err != nil {
		return err
	}

	provider.Hash = hashedPassword
	provider.Verified = true

	if _, err := gorm.G[db.Provider](s.db).Where(repo.Provider.ID.Eq(provider.ID)).Updates(ctx, provider); err != nil {
		return err
	}

	return nil
}

func (s *Service) VerifyEmailCode(ctx context.Context, email, code string) (string, error) {
	email = strings.ToLower(strings.TrimSpace(email))

	if err := core.Require("email", email, "code", code); err != nil {
		return "", err
	}

	provider, err := gorm.G[db.Provider](s.db).Preload("users", func(db gorm.PreloadBuilder) error {
		db.Where(repo.User.Email.Eq(email))
		return nil
	}).Where("type = ?", db.ProviderEmail).First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", errors.New("invalid email or code")
		}
		return "", err
	}

	if provider.UserID == uuid.Nil {
		return "", errors.New("associated user not found")
	}

	if provider.User.Email != email {
		return "", errors.New("email mismatch")
	}

	v, err := gorm.G[db.VerificationCode](s.db).Where(repo.VerificationCode.UserID.Eq(provider.UserID)).Where(repo.VerificationCode.Code.Eq(code)).Where(repo.VerificationCode.ExpiresAt.Gte(time.Now())).First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", errors.New("invalid email or code")
		}
		return "", err
	}

	if v.Reason != db.EmailVerificationReason {
		return "", errors.New("invalid verification code")
	}

	provider.Verified = true
	if _, err := gorm.G[db.Provider](s.db).Where(repo.Provider.ID.Eq(provider.ID)).Updates(ctx, provider); err != nil {
		return "", err
	}

	return provider.UserID.String(), nil
}

func (s *Service) SignInWithOAuth(ctx context.Context, provider, externalID, email, name, avatarURL string) (string, error) {

	user, err := gorm.G[db.User](s.db).Where(repo.User.Email.Eq(email)).First(ctx)
	if err != nil {

		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return "", err
		}

		user = db.User{
			Email:     email,
			Name:      core.StrPtr(name),
			AvatarUrl: core.StrPtr(avatarURL),
		}

		err := gorm.G[db.User](s.db).Create(ctx, &user)
		if err != nil {
			return "", err
		}
	}

	providerType, err := db.ParseProvider(provider)
	if err != nil {
		return "", err
	}

	providerRecord := db.Provider{
		Type:       providerType,
		ProviderID: core.StrPtr(externalID),
		UserID:     user.ID,
	}

	err = gorm.G[db.Provider](s.db).Create(ctx, &providerRecord)
	if err != nil {
		return "", err
	}

	return user.ID.String(), nil
}

func (s *Service) GetUser(ctx context.Context, userID string) (db.User, error) {

	user, err := gorm.G[db.User](s.db).Preload("providers", func(db gorm.PreloadBuilder) error {
		db.Select("type", "verified", "created_at").Where(repo.Provider.UserID.Eq(uuid.MustParse(userID)))
		return nil
	}).Where(repo.User.ID.Eq(uuid.MustParse(userID))).First(ctx)

	return user, err

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

func (s *Service) createDefaultSubscription(ctx context.Context, userID uuid.UUID) error {
	if s.cfg.IsSelfHost() {
		periodEnd := time.Now().AddDate(100, 0, 0)
		sub := db.Subscription{
			UserID:             userID,
			Plan:               "selfhost",
			MonthlyEventLimit:  -1,
			Status:             "active",
			CurrentPeriodEnd:   periodEnd,
			MaxProjects:        -1,
			MaxConfigKeys:      -1,
			ErrorRetentionDays: 90,
			SupportsRollout:    true,
		}
		return gorm.G[db.Subscription](s.db).Create(ctx, &sub)

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
		return s.createDefaultSubscription(ctx, userID)
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

// TODO: remove this function and use SignInWithOAuth instead, need to update handler and tests accordingly
// func (s *Service) UpsertOAuthUser(ctx context.Context, provider, externalID, email, name, avatarURL string) (string, error) {

// 	user, err := s.FindUserByProvider(ctx, provider, externalID)
// 	if err == nil {
// 		if err := s.UpdateUserFromProvider(ctx, provider, externalID, email, name, avatarURL); err != nil {
// 			return "", err
// 		}

// 		if err := s.ensureActiveSubscription(ctx, user.ID); err != nil {
// 			return "", err
// 		}
// 		return user.ID.String(), nil
// 	}

// 	if !errors.Is(err, gorm.ErrRecordNotFound) {
// 		return "", err
// 	}

// 	emailUser, err := gorm.G[db.User](s.db).Where(repo.User.Email.Eq(email)).First(ctx)
// 	if err == nil {
// 		if err := s.linkProviderToUser(ctx, provider, externalID, emailUser.ID); err != nil {
// 			return "", err
// 		}

// 		if err := s.UpdateUserFromProvider(ctx, provider, externalID, email, name, avatarURL); err != nil {
// 			return "", err
// 		}

// 		if err := s.ensureActiveSubscription(ctx, emailUser.ID); err != nil {
// 			return "", err
// 		}

// 		return emailUser.ID.String(), nil
// 	}

// 	if !errors.Is(err, gorm.ErrRecordNotFound) {
// 		return "", err
// 	}

// 	u := db.User{
// 		Email:     email,
// 		Name:      core.StrPtr(name),
// 		AvatarUrl: core.StrPtr(avatarURL),
// 	}

// 	err = gorm.G[db.User](s.db).Create(ctx, &u)
// 	if err != nil {
// 		return "", err
// 	}

// 	if err := s.createDefaultSubscription(ctx, u.ID); err != nil {
// 		return "", err
// 	}
// 	return u.ID.String(), nil
// }

// func (s *Service) FindUserByProvider(ctx context.Context, provider, externalID string) (db.User, error) {

// 	switch provider {
// 	case "github":
// 		return gorm.G[db.User](s.db).Where("github_id = ?", externalID).First(ctx)

// 	case "google":
// 		return gorm.G[db.User](s.db).Where("google_id = ?", externalID).First(ctx)
// 	default:
// 		return db.User{}, errors.New("unsupported oauth provider")
// 	}
// }

// func (s *Service) UpdateUserFromProvider(ctx context.Context, provider, externalID, email, name, avatarURL string) error {
// 	switch provider {
// 	case "github":
// 		_, err := gorm.G[db.User](s.db).Where("github_id = ?", externalID).Updates(ctx, db.User{
// 			Email:     email,
// 			Name:      core.StrPtr(name),
// 			AvatarUrl: core.StrPtr(avatarURL),
// 			GithubID:  core.StrPtr(externalID),
// 		})
// 		return err
// 	case "google":
// 		_, err := gorm.G[db.User](s.db).Where("google_id = ?", externalID).Updates(ctx, db.User{
// 			Email:     email,
// 			Name:      core.StrPtr(name),
// 			AvatarUrl: core.StrPtr(avatarURL),
// 			GoogleID:  core.StrPtr(externalID),
// 		})
// 		return err
// 	default:
// 		return errors.New("unsupported oauth provider")
// 	}
// }

// func (s *Service) linkProviderToUser(ctx context.Context, provider, externalID string, userID uuid.UUID) error {
// 	switch provider {
// 	case "github":
// 		_, err := gorm.G[db.User](s.db).Where(repo.User.ID.Eq(userID)).Updates(ctx, db.User{
// 			GithubID: core.StrPtr(externalID),
// 		})
// 		return err
// 	case "google":
// 		_, err := gorm.G[db.User](s.db).Where(repo.User.ID.Eq(userID)).Updates(ctx, db.User{
// 			GoogleID: core.StrPtr(externalID),
// 		})
// 		return err
// 	default:
// 		return errors.New("unsupported oauth provider")
// 	}
// }

// func (s *Service) CreateUser(ctx context.Context, email, name, avatarURL string, provider string, providerId string) (string, error) {
// 	email = strings.ToLower(strings.TrimSpace(email))
// 	if err := core.Require("email", email); err != nil {
// 		return "", err
// 	}

// 	u := db.User{
// 		Email:     email,
// 		Name:      core.StrPtr(name),
// 		AvatarUrl: core.StrPtr(avatarURL),
// 	}

// 	err := gorm.G[db.User](s.db).Create(ctx, &u)
// 	if err != nil {
// 		return "", err
// 	}

// 	if provider != "" && providerId != "" {
// 		if err := s.linkProviderToUser(ctx, provider, providerId, u.ID); err != nil {
// 			return "", err
// 		}
// 	}

// 	if err := s.createDefaultSubscription(ctx, u.ID); err != nil {
// 		return "", err
// 	}

// 	return u.ID.String(), nil
// }

// func (s *Service) TokenLogin(ctx context.Context, token string) (string, error) {

// 	if s.cfg.AdminToken == "" {
// 		return "", errors.New("admin token login is not enabled")
// 	}

// 	if token != s.cfg.AdminToken {
// 		return "", errors.New("invalid token provided")
// 	}

// 	adminEmail := "admin@trackion.local"
// 	name := "Admin"

// 	u, err := gorm.G[db.User](s.db).Where(repo.User.Email.Eq(adminEmail)).First(ctx)
// 	if errors.Is(err, gorm.ErrRecordNotFound) {
// 		slog.Info("USER NOT FOUND CREATING DEFAULT")
// 		user := db.User{
// 			Email:     adminEmail,
// 			Name:      &name,
// 			CreatedAt: time.Now(),
// 			AvatarUrl: nil,
// 		}

// 		err := gorm.G[db.User](s.db).Create(ctx, &user)
// 		if err != nil {
// 			return "", err
// 		}

// 		u.ID = user.ID

// 	}
// 	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
// 		return "", err
// 	}

// 	if err := s.ensureActiveSubscription(ctx, u.ID); err != nil {
// 		return "", err
// 	}

// 	sessionToken, err := s.CreateSession(ctx, u.ID.String())
// 	slog.Info(sessionToken)
// 	return sessionToken, nil
// }
//
