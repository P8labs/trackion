package main

import (
	"log"
	"log/slog"
	"os"
	"trackion/internal/config"
	types "trackion/internal/db"
	"trackion/internal/worker"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var version = "dev"

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Printf("No .env file loaded (%v), falling back to system environment", err)
	}

	cfg := config.Load()

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)
	logger.Info("starting trackion server", "version", version)

	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(
		&types.User{},
		&types.Subscription{},
		&types.Session{},
		&types.Project{},
		&types.Event{},
		&types.ReplaySession{},
		&types.ReplayChunk{},
		&types.Flag{},
		&types.Config{},
	)

	// Run custom migrations for error tracking indexes
	if err := types.RunMigrations(db, logger); err != nil {
		panic("failed to run custom migrations")
	}

	workerManager := worker.NewManager(logger)

	if err := workerManager.Register(worker.NewMaintenanceJob(db, *cfg, logger)); err != nil {
		panic(err)
	}

	workerManager.Start()
	defer worker.StopWithTimeout(workerManager, cfg.CleanupTimeoutSec)

	api := application{
		config: cfg,
		db:     db,
		logger: logger,
	}
	if err := api.run(api.mount()); err != nil {
		slog.Error("server failed to start", "error", err)
		os.Exit(1)
	}
}
