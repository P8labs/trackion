package auth

import (
	"fmt"
	"trackion/internal/config"

	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/github"
)

func InitOAuth(cfg config.Config) {
	goth.UseProviders(
		github.New(
			cfg.GithubClientID,
			cfg.GithubClientSecret,
			fmt.Sprintf("%s/auth/callback/github", cfg.BaseURL),
			"user:email",
		),
	)
}
