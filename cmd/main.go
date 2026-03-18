package main

import (
	"context"
	"log"
	"log/slog"
	"os"
	"trackion/internal/config"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %s", err)
	}

	ctx := context.Background()

	cfg := config.Load()

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	dbpool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		panic(err)
	}
	defer dbpool.Close()

	if err := dbpool.Ping(ctx); err != nil {
		panic(err)
	}

	logger.Info("connected to database with connection pool")

	api := application{
		config: cfg,
		db:     dbpool,
		logger: logger,
	}
	if err := api.run(api.mount()); err != nil {
		slog.Error("server failed to start", "error", err)
		os.Exit(1)
	}
}
