package mail

import (
	"log"
	"trackion/internal/config"
	db "trackion/internal/db/models"

	"github.com/resend/resend-go/v3"
)

type Service struct {
	cfg config.Config
}

func NewService(cfg config.Config) *Service {
	return &Service{
		cfg: cfg,
	}
}

func (s *Service) SendEmailVerification(toEmail, mailType, code string) error {

	if s.cfg.ResendAPIKey == "" {
		log.Printf("[EMAIL SKIPPED]: Resend API key not configured, cannot send email to %s", toEmail)
		log.Printf("[EMAIL SKIPPED]: intended mail type: %s", mailType)
		log.Printf("[EMAIL SKIPPED]: intended verification code: %s", code)
		return nil
	}

	template := ""

	switch mailType {
	case db.EmailVerificationReason:
		template = "email-verification"
	case db.PasswordResetReason:
		template = "password-reset"
	case db.AccountDeletionReason:
		template = "account-deletion"
	}

	if template == "" {
		log.Printf("[EMAIL SKIPPED]: invalid mail type: %s", mailType)
		return nil
	}

	client := resend.NewClient(s.cfg.ResendAPIKey)

	params := &resend.SendEmailRequest{
		From: "Team Trackion <security@trackion.p8labs.in>",
		To:   []string{toEmail},
		Template: &resend.EmailTemplate{
			Id: template,
			Variables: map[string]any{
				"code": code,
			},
		},
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		log.Printf("[EMAIL ERROR]: failed to send email to %s: %v", toEmail, err)
		return err
	}

	log.Printf("[EMAIL SENT]: email sent to %s for mail type %s", toEmail, mailType)

	return nil
}
