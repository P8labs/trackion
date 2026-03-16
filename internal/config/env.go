package config

import (
	"os"
	"strconv"
)

func GetEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}

func MustEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		panic("missing required env: " + key)
	}
	return val
}

func GetEnvBool(key string, fallback bool) bool {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}

	b, err := strconv.ParseBool(val)
	if err != nil {
		panic("invalid bool env: " + key)
	}

	return b
}

func GetEnvInt(key string, fallback int) int {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}

	i, err := strconv.Atoi(val)
	if err != nil {
		panic("invalid int env: " + key)
	}

	return i
}
