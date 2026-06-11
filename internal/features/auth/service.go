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

func NewService(db *gorm.DB, cfg config.Config) *Service {
	return &Service{
		db:   db,
		cfg:  cfg,
		mail: mail.NewService(cfg),
	}
}

func (s *Service) SignUpWithEmail(ctx context.Context, email, password string) (uuid.UUID, error) {
	email = strings.ToLower(strings.TrimSpace(email))

	if err := core.Require("email", email, "password", password); err != nil {
		return uuid.Nil, err
	}

	extractedName := strings.Split(email, "@")[0]
	name := strings.Title(strings.ReplaceAll(extractedName, ".", " "))

	hashedPassword, err := core.HashPassword(password)
	if err != nil {
		return uuid.Nil, err
	}

	user := db.User{
		Email: email,
		Name:  &name,
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		if err := gorm.G[db.User](tx).Create(ctx, &user); err != nil {
			if errors.Is(err, gorm.ErrDuplicatedKey) {
				return errors.New("email already in use")
			}
			if strings.Contains(err.Error(), "uni_users_email") {
				return errors.New("email already in use")
			}

			return err
		}

		provider := db.Provider{
			Type:     db.ProviderEmail,
			Hash:     hashedPassword,
			Verified: false,
			UserID:   user.ID,
		}

		if err := gorm.G[db.Provider](tx).Create(ctx, &provider); err != nil {
			return err
		}

		// send verification email
		if err := s.SendVerificationEmail(ctx, db.EmailVerificationReason, email); err != nil {
			log.Printf("failed to send verification email to %s: %v", email, err)
		}

		return nil
	})

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return uuid.Nil, errors.New("email already in use")
		}
		return uuid.Nil, err
	}

	return user.ID, nil
}

func (s *Service) SignInWithEmail(ctx context.Context, email, password string) (uuid.UUID, error) {
	email = strings.ToLower(strings.TrimSpace(email))

	if err := core.Require("email", email, "password", password); err != nil {
		return uuid.Nil, err
	}

	user, err := gorm.G[db.User](s.db).
		Preload("Providers", nil).
		Where(repo.User.Email.Eq(email)).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return uuid.Nil, errors.New("invalid email or password")
		}
		return uuid.Nil, err
	}

	var emailProvider *db.Provider
	var hasSocialProvider bool

	for i := range user.Providers {
		switch user.Providers[i].Type {
		case db.ProviderEmail:
			emailProvider = &user.Providers[i]
		case db.ProviderGithub, db.ProviderGoogle:
			hasSocialProvider = true
		}
	}

	if emailProvider == nil {
		if hasSocialProvider {
			return uuid.Nil, errors.New("account exists without a password, please login with your oauth provider")
		}
		return uuid.Nil, errors.New("invalid email or password")
	}

	if !core.CheckPasswordHash(password, emailProvider.Hash) {
		return uuid.Nil, errors.New("invalid email or password")
	}

	return user.ID, nil
}

func (s *Service) SendVerificationEmail(ctx context.Context, reason db.EmailReason, email string) error {
	email = strings.ToLower(strings.TrimSpace(email))

	if err := core.Require("email", email); err != nil {
		return err
	}

	user, err := gorm.G[db.User](s.db).
		Where(repo.User.Email.Eq(email)).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("email not found")
		}
		return err
	}

	if user.EmailAttempts >= 3 && user.LastEmailSent != nil {
		elapsed := time.Since(*user.LastEmailSent)
		switch {
		case elapsed > 24*time.Hour:
			user.EmailAttempts = 0 // Reset attempts

		case elapsed > 15*time.Minute:
			log.Println("warning: too many email attempts")

		default:
			return errors.New("too many attempts, please try again later")
		}
	}

	user.EmailAttempts++
	now := time.Now()
	user.LastEmailSent = &now

	err = s.db.WithContext(ctx).Model(&db.User{}).
		Where("id = ?", user.ID).
		Updates(map[string]interface{}{
			"email_attempts":  user.EmailAttempts,
			"last_email_sent": user.LastEmailSent,
		}).Error

	if err != nil {
		return err
	}

	var code string
	for range 3 {
		token, err := core.GenerateRandomCode(6)
		if err != nil {
			return err
		}

		verification := db.VerificationCode{
			UserID:    user.ID,
			Token:     strings.ToUpper(token),
			ExpiresAt: time.Now().Add(15 * time.Minute),
			Reason:    string(reason),
		}

		err = gorm.G[db.VerificationCode](s.db).Create(ctx, &verification)
		if err != nil {
			if errors.Is(err, gorm.ErrDuplicatedKey) {
				continue
			}
			return err
		}

		code = strings.ToUpper(token)
		break
	}

	if code == "" {
		return errors.New("failed to generate unique verification code")
	}

	if err := s.mail.SendEmailVerification(user.Email, reason, code); err != nil {
		return err
	}

	return nil

}

func (s *Service) PasswordReset(ctx context.Context, code, newPassword string) error {
	code = strings.TrimSpace(code)

	if err := core.Require("code", code, "new_password", newPassword); err != nil {
		return err
	}

	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var v db.VerificationCode
		err := tx.Where("token = ?", strings.ToUpper(code)).
			Where("expires_at >= ?", time.Now()).
			First(&v).Error

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("invalid or expired verification code")
			}
			return err
		}

		if v.Reason != string(db.PasswordResetReason) {
			return errors.New("invalid verification code")
		}

		var providers []db.Provider
		if err := tx.Where("user_id = ?", v.UserID).Find(&providers).Error; err != nil {
			return errors.New("associated user not found")
		}

		var emailProvider *db.Provider
		var socialProvider *db.Provider

		for i := range providers {
			switch providers[i].Type {
			case db.ProviderEmail:
				emailProvider = &providers[i]
			case db.ProviderGithub, db.ProviderGoogle:
				socialProvider = &providers[i]
			}
		}

		hashedPassword, err := core.HashPassword(newPassword)
		if err != nil {
			return err
		}

		if emailProvider == nil && socialProvider != nil {
			// Create email provider for OAuth users setting a password for the first time
			p := db.Provider{
				Type:     db.ProviderEmail,
				Hash:     hashedPassword,
				Verified: true,
				UserID:   socialProvider.UserID,
			}
			if err := tx.Create(&p).Error; err != nil {
				return err
			}
		} else if emailProvider != nil {
			err := tx.Model(&db.Provider{}).
				Where("id = ?", emailProvider.ID).
				Updates(map[string]any{
					"hash":     hashedPassword,
					"verified": true,
				}).Error

			if err != nil {
				return err
			}
		} else {
			return errors.New("no valid provider found to update")
		}

		if err := tx.Delete(&v).Error; err != nil {
			return err
		}

		return nil
	})
}
func (s *Service) VerifyEmailCode(ctx context.Context, code string) (string, error) {

	if err := core.Require("code", code); err != nil {
		return "", err
	}

	v, err := gorm.G[db.VerificationCode](s.db).
		Where(repo.VerificationCode.Token.Eq(strings.ToUpper(code))).
		Where(repo.VerificationCode.Reason.Eq(string(db.EmailVerificationReason))).
		Where(repo.VerificationCode.ExpiresAt.Gte(time.Now())).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", errors.New("invalid or expired verification code")
		}
		return "", err
	}

	provider, err := gorm.G[db.Provider](s.db).
		Where(repo.Provider.UserID.Eq(v.UserID)).
		Where(repo.Provider.Type.Eq(db.ProviderEmail)).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", errors.New("associated user not found")
		}
		return "", err
	}

	provider.Verified = true
	if _, err := gorm.G[db.Provider](s.db).
		Where(repo.Provider.ID.Eq(provider.ID)).
		Updates(ctx, provider); err != nil {
		return "", err
	}

	if _, err := gorm.G[db.VerificationCode](s.db).Where(repo.VerificationCode.ID.Eq(v.ID)).Delete(ctx); err != nil {
		return "", err
	}

	return provider.UserID.String(), nil
}
func (s *Service) SignInWithOAuth(ctx context.Context, provider, externalID, email, name, avatarURL string) (uuid.UUID, error) {

	user, err := gorm.G[db.User](s.db).Where(repo.User.Email.Eq(email)).First(ctx)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return uuid.Nil, err
		}

		user = db.User{
			Email:     email,
			Name:      &name,
			AvatarUrl: &avatarURL,
		}

		err := gorm.G[db.User](s.db).Create(ctx, &user)
		if err != nil {
			return uuid.Nil, err
		}
	} else {
		s.db.WithContext(ctx).Model(&db.User{}).Where("id = ?", user.ID).Updates(map[string]any{
			"name":       name,
			"avatar_url": avatarURL,
		})
	}

	providerType, err := db.ParseProvider(provider)
	if err != nil {
		return uuid.Nil, err
	}

	existingProvider, err := gorm.G[db.Provider](s.db).
		Where(repo.Provider.UserID.Eq(user.ID)).
		Where(repo.Provider.Type.Eq(providerType)).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			providerRecord := db.Provider{
				Type:       providerType,
				ProviderID: &externalID,
				UserID:     user.ID,
				Verified:   true,
			}

			err = gorm.G[db.Provider](s.db).Create(ctx, &providerRecord)
			if err != nil {
				return uuid.Nil, err
			}
			return user.ID, nil
		}
		return uuid.Nil, err
	}

	err = s.db.WithContext(ctx).Model(&db.Provider{}).
		Where("id = ?", existingProvider.ID).
		Updates(map[string]any{
			"provider_id": externalID,
			"verified":    true,
		}).Error

	if err != nil {
		return uuid.Nil, err
	}

	return user.ID, nil
}

func (s *Service) GetUser(ctx context.Context, userID string) (UserResponse, error) {
	uid := uuid.MustParse(userID)

	user, err := gorm.G[db.User](s.db).
		Preload("Subscription", nil).
		Preload("Providers", func(db gorm.PreloadBuilder) error {
			db.Select("user_id", "type", "verified", "created_at")
			return nil
		}).
		Where(repo.User.ID.Eq(uid)).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return UserResponse{}, errors.New("user not found")
		}
		return UserResponse{}, err
	}

	isEmailVerified := true
	for _, p := range user.Providers {
		if p.Type == db.ProviderEmail && !p.Verified {
			isEmailVerified = false
			break
		}

	}

	isActiveSubscription := false
	if user.Subscription.Status == "active" && user.Subscription.CurrentPeriodEnd.After(time.Now()) {
		isActiveSubscription = true
	}

	providers := make([]UserProvider, len(user.Providers))
	for i, p := range user.Providers {
		providers[i] = UserProvider{
			Type:      p.Type,
			Verified:  p.Verified,
			CreatedAt: p.CreatedAt.String(),
			UpdatedAt: p.UpdatedAt.String(),
		}
	}

	return UserResponse{
		ID:                   user.ID.String(),
		Email:                user.Email,
		Name:                 user.Name,
		AvatarUrl:            user.AvatarUrl,
		CreatedAt:            user.CreatedAt.String(),
		UpdatedAt:            user.UpdatedAt.String(),
		IsEmailVerified:      isEmailVerified,
		IsActiveSubscription: isActiveSubscription,
		SubscriptionPlan:     user.Subscription.Plan,
		EndsAt:               user.Subscription.CurrentPeriodEnd.String(),
		Providers:            providers,
	}, nil
}

func (s *Service) CreateSession(ctx context.Context, userID uuid.UUID) (string, error) {

	token, err := core.GenerateSessionToken()
	if err != nil {
		return "", err
	}

	session := db.Session{
		UserID:    userID,
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

// func (s *Service) createDefaultSubscription(ctx context.Context, userID uuid.UUID) error {
// 	if s.cfg.IsSelfHost() {
// 		periodEnd := time.Now().AddDate(100, 0, 0)
// 		sub := db.Subscription{
// 			UserID:             userID,
// 			Plan:               "selfhost",
// 			MonthlyEventLimit:  -1,
// 			Status:             "active",
// 			CurrentPeriodEnd:   periodEnd,
// 			MaxProjects:        -1,
// 			MaxConfigKeys:      -1,
// 			ErrorRetentionDays: 90,
// 			SupportsRollout:    true,
// 		}
// 		return gorm.G[db.Subscription](s.db).Create(ctx, &sub)

// 	}

// 	periodEnd := time.Now().AddDate(0, 1, 0)

// 	sub := db.Subscription{
// 		UserID:            userID,
// 		Plan:              "free",
// 		MonthlyEventLimit: defaultMonthlyEventLimit,
// 		Status:            "active",
// 		CurrentPeriodEnd:  periodEnd,
// 	}

// 	return gorm.G[db.Subscription](s.db).Create(ctx, &sub)
// }

// func (s *Service) ensureActiveSubscription(ctx context.Context, userID uuid.UUID) error {
// 	if s.cfg.IsSelfHost() {
// 		return s.createDefaultSubscription(ctx, userID)
// 	}

// 	subscription, err := gorm.G[db.Subscription](s.db).Where(repo.Subscription.UserID.Eq(userID)).First(ctx)
// 	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
// 		return err
// 	}

// 	if errors.Is(err, gorm.ErrRecordNotFound) {
// 		return s.createDefaultSubscription(ctx, userID)
// 	}

// 	if subscription.Plan == "free" {
// 		_, err := gorm.G[db.Subscription](s.db).
// 			Where(repo.Subscription.ID.Eq(userID)).
// 			Where(repo.Subscription.Status.Eq("active")).
// 			Where(repo.Subscription.Plan.Eq("free")).
// 			Where(repo.Subscription.CurrentPeriodEnd.IsNull()).Or(
// 			repo.Subscription.CurrentPeriodEnd.Lte(time.Now()),
// 		).
// 			Set(repo.Subscription.CurrentPeriodEnd.Set(time.Now().AddDate(0, 1, 0))).
// 			Update(ctx)
// 		if err != nil {
// 			return err
// 		}
// 	}

// 	return nil
// }

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
