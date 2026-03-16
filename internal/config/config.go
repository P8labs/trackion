package config

type Mode string

const (
	ModeSaaS     Mode = "saas"
	ModeSelfHost Mode = "selfhost"
)

type Config struct {
	Mode               Mode
	Port               string
	DatabaseURL        string
	JWTSecret          string
	GithubClientID     string
	GithubClientSecret string
	AdminToken         string
	BaseURL            string

	EventBodySizeLimit int32
	EventBatchLimit    int32
}

func Load() *Config {

	mode := Mode(GetEnv("TRACKION_MODE", "saas"))
	cfg := &Config{
		Mode:               mode,
		Port:               GetEnv("PORT", "8000"),
		DatabaseURL:        MustEnv("DATABASE_URL"),
		JWTSecret:          MustEnv("JWT_SECRET"),
		GithubClientID:     GetEnv("GITHUB_CLIENT_ID", ""),
		GithubClientSecret: GetEnv("GITHUB_CLIENT_SECRET", ""),
		AdminToken:         GetEnv("TRACKION_ADMIN_TOKEN", ""),
		BaseURL:            GetEnv("BASE_URL", "http://locahost:8000"),

		EventBodySizeLimit: 264,
		EventBatchLimit:    100,
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
