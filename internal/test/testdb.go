package test

import (
	"log/slog"
	"os"
	"testing"
	m "trackion/internal/db"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func SetupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	if err := m.RunMigrations(db, logger); err != nil {
		panic("failed to run custom migrations")
	}
	return db
}
