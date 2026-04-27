package test

import (
	"log/slog"
	"net/http"
	"testing"
	"trackion/internal/app"
	"trackion/internal/config"
)

func NewTestApp(t *testing.T) http.Handler {
	db := SetupTestDB(t)
	cfg := config.Load()

	logger := slog.New(slog.NewTextHandler(nil, &slog.HandlerOptions{Level: slog.LevelError}))

	api := app.NewApplication(db, cfg, logger, "test")
	return api.Handler()
}
