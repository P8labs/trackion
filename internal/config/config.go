package config

import "strings"

type Mode string

const (
	ModeSaaS     Mode = "saas"
	ModeSelfHost Mode = "selfhost"
)

type Config struct {
	Mode               Mode
	Port               string
	DatabaseURL        string
	GithubClientID     string
	GithubClientSecret string
	AdminToken         string
	BaseURL            string
	AuthSecret         string
	EventBodySizeLimit int32
	EventBatchLimit    int32
	FrontendURL        string
	AllowedOrigins     []string
}

func Load() *Config {

	mode := Mode(GetEnv("TRACKION_MODE", "saas"))
	cors := GetEnv("CORS_ORIGINS", "*")

	allowedCors := strings.Split(cors, ",")

	cfg := &Config{
		Mode:               mode,
		Port:               GetEnv("PORT", "8000"),
		DatabaseURL:        MustEnv("DATABASE_URL"),
		GithubClientID:     GetEnv("GITHUB_CLIENT_ID", ""),
		GithubClientSecret: GetEnv("GITHUB_CLIENT_SECRET", ""),
		AdminToken:         GetEnv("TRACKION_ADMIN_TOKEN", ""),
		BaseURL:            GetEnv("BASE_URL", "http://localhost:8000"),
		AuthSecret:         GetEnv("AUTH_SECRET", "random-noise"),
		EventBodySizeLimit: 256,
		EventBatchLimit:    100,
		FrontendURL:        GetEnv("FRONTEND_URL", "http://localhost:5173"),
		AllowedOrigins:     allowedCors,
	}

	if mode == ModeSelfHost && cfg.AdminToken == "" {
		panic("TRACKION_ADMIN_TOKEN required in selfhost mode")
	}

	return cfg
}

func (c *Config) IsSelfHost() bool {
	return c.Mode == ModeSelfHost
}

func (c *Config) IsSaaS() bool {
	return c.Mode == ModeSaaS
}
