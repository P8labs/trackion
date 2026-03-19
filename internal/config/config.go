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
	EventRetentionDays int
	ProjectDeleteAfter int
	CleanupCronSpec    string
	CleanupTimeoutSec  int
}

func Load() *Config {

	mode := Mode(GetEnv("TRACKION_MODE", "saas"))
	cors := GetEnv("CORS_ORIGINS", "*")

	raw := strings.Split(cors, ",")
	allowedCors := make([]string, 0, len(raw))

	for _, o := range raw {
		o = strings.TrimSpace(o)
		if o != "" {
			allowedCors = append(allowedCors, o)
		}
	}

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
		EventRetentionDays: GetEnvInt("EVENT_RETENTION_DAYS", 30),
		ProjectDeleteAfter: GetEnvInt("PROJECT_DELETE_AFTER_DAYS", 7),
		CleanupCronSpec:    GetEnv("CLEANUP_CRON_SPEC", "@every 1h"),
		CleanupTimeoutSec:  GetEnvInt("CLEANUP_TIMEOUT_SEC", 300),
	}

	if cfg.EventRetentionDays < 1 {
		cfg.EventRetentionDays = 30
	}

	if cfg.ProjectDeleteAfter < 0 {
		cfg.ProjectDeleteAfter = 7
	}

	if cfg.CleanupTimeoutSec < 10 {
		cfg.CleanupTimeoutSec = 300
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
