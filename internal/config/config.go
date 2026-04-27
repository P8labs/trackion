package config

import (
	"log"
	"strings"

	"github.com/joho/godotenv"
)

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
	GoogleClientID     string
	GoogleClientSecret string
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
	BatchProjectRPS    int
	BatchProjectBurst  int
	BatchIPRPM         int
	RateLimitTTLMin    int
	RateLimitCleanupS  int
	GeoLookupEnabled   bool
	GeoLookupProvider  string
	GeoLookupTimeoutMS int
	GeoCacheTTLMin     int
	GeoCleanupSec      int
}

func Load() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Printf("No .env file loaded (%v), falling back to system environment", err)
	}

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
		GoogleClientID:     GetEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: GetEnv("GOOGLE_CLIENT_SECRET", ""),
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
		BatchProjectRPS:    GetEnvInt("RATE_LIMIT_BATCH_PROJECT_RPS", 10),
		BatchProjectBurst:  GetEnvInt("RATE_LIMIT_BATCH_PROJECT_BURST", 20),
		BatchIPRPM:         GetEnvInt("RATE_LIMIT_BATCH_IP_RPM", 100),
		RateLimitTTLMin:    GetEnvInt("RATE_LIMIT_TTL_MIN", 10),
		RateLimitCleanupS:  GetEnvInt("RATE_LIMIT_CLEANUP_SEC", 60),
		GeoLookupEnabled:   GetEnvBool("GEO_LOOKUP_ENABLED", true),
		GeoLookupProvider:  GetEnv("GEO_LOOKUP_PROVIDER", "https://ipwho.is"),
		GeoLookupTimeoutMS: GetEnvInt("GEO_LOOKUP_TIMEOUT_MS", 350),
		GeoCacheTTLMin:     GetEnvInt("GEO_CACHE_TTL_MIN", 60),
		GeoCleanupSec:      GetEnvInt("GEO_CLEANUP_SEC", 300),
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

	if cfg.BatchProjectRPS < 1 {
		cfg.BatchProjectRPS = 10
	}

	if cfg.BatchProjectBurst < cfg.BatchProjectRPS {
		cfg.BatchProjectBurst = cfg.BatchProjectRPS * 2
	}

	if cfg.BatchIPRPM < 1 {
		cfg.BatchIPRPM = 100
	}

	if cfg.RateLimitTTLMin < 1 {
		cfg.RateLimitTTLMin = 10
	}

	if cfg.RateLimitCleanupS < 5 {
		cfg.RateLimitCleanupS = 60
	}

	if cfg.GeoLookupTimeoutMS < 50 {
		cfg.GeoLookupTimeoutMS = 350
	}

	if cfg.GeoCacheTTLMin < 1 {
		cfg.GeoCacheTTLMin = 60
	}

	if cfg.GeoCleanupSec < 30 {
		cfg.GeoCleanupSec = 300
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
