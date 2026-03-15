package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"trackion/internal/config"

	"github.com/jackc/pgx/v5"
)

func main() {
	ctx := context.Background()

	cfg := appConfig{
		addr: fmt.Sprintf(":%s", config.GetEnv("PORT", "8000")),
		db: dbConfig{
			url: config.GetEnv("GOOSE_DBSTRING", "postgres://user:password@localhost:5432/db"),
		},
	}

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	conn, err := pgx.Connect(ctx, cfg.db.url)
	if err != nil {
		panic(err)
	}
	defer conn.Close(ctx)

	logger.Info("connected to database")

	api := application{
		config: cfg,
		db:     conn,
		logger: logger,
	}
	if err := api.run(api.mount()); err != nil {
		slog.Error("server failed to start", "error", err)
		os.Exit(1)
	}
}
