package main

import (
	"log/slog"
	"os"
	"trackion/internal/app"
	"trackion/internal/config"
	m "trackion/internal/db"
	"trackion/internal/worker"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var version = "0.0.0-dev"

func main() {

	cfg := config.Load()

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)
	logger.Info("starting trackion server", "version", version)

	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	if err := m.RunMigrations(db, logger); err != nil {
		panic("failed to run custom migrations")
	}

	workerManager := worker.NewManager(logger)

	if err := workerManager.Register(worker.NewMaintenanceJob(db, *cfg, logger)); err != nil {
		panic(err)
	}

	workerManager.Start()
	defer worker.StopWithTimeout(workerManager, cfg.CleanupTimeoutSec)

	api := app.NewApplication(db, cfg, logger, version)

	if err := api.Run(api.Handler()); err != nil {
		slog.Error("server failed to start", "error", err)
		os.Exit(1)
	}
}
