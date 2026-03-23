package auth

import (
	"fmt"
	"trackion/internal/config"

	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/github"
	"github.com/markbates/goth/providers/google"
)

func InitOAuth(cfg config.Config) {
	providers := make([]goth.Provider, 0, 2)

	if cfg.GithubClientID != "" && cfg.GithubClientSecret != "" {
		providers = append(providers,
			github.New(
				cfg.GithubClientID,
				cfg.GithubClientSecret,
				fmt.Sprintf("%s/auth/callback/github", cfg.BaseURL),
				"user:email",
			),
		)
	}

	if cfg.GoogleClientID != "" && cfg.GoogleClientSecret != "" {
		providers = append(providers,
			google.New(
				cfg.GoogleClientID,
				cfg.GoogleClientSecret,
				fmt.Sprintf("%s/auth/callback/google", cfg.BaseURL),
				"email",
				"profile",
			),
		)
	}

	if len(providers) > 0 {
		goth.UseProviders(providers...)
	}
}
