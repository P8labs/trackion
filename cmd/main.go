package main

import (
	"context"
	"embed"
	"log"
	"log/slog"
	"os"
	"trackion/internal/config"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"

	"github.com/pressly/goose/v3"
)

//go:embed migrations/*.sql
var embedMigrations embed.FS

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

	if err := runMigrations(dbpool); err != nil {
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
func runMigrations(dbpool *pgxpool.Pool) error {
	sqlDB := stdlib.OpenDBFromPool(dbpool)
	defer sqlDB.Close()

	goose.SetBaseFS(embedMigrations)

	if err := goose.SetDialect("postgres"); err != nil {
		return err
	}

	if err := goose.Up(sqlDB, "migrations"); err != nil {
		return err
	}

	slog.Info("migrations applied successfully")
	return nil
}
