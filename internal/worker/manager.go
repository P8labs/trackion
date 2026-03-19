package worker

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/robfig/cron/v3"
)

type Job interface {
	Name() string
	Spec() string
	Run(ctx context.Context) error
}

type Manager struct {
	cron   *cron.Cron
	logger *slog.Logger
}

func NewManager(logger *slog.Logger) *Manager {
	if logger == nil {
		logger = slog.Default()
	}

	cronLogger := cron.VerbosePrintfLogger(slog.NewLogLogger(logger.Handler(), slog.LevelInfo))

	c := cron.New(
		cron.WithLogger(cronLogger),
		cron.WithChain(cron.Recover(cronLogger)),
	)

	return &Manager{cron: c, logger: logger}
}

func (m *Manager) Register(job Job) error {
	_, err := m.cron.AddFunc(job.Spec(), func() {
		start := time.Now()
		m.logger.Info("worker job started", "job", job.Name(), "spec", job.Spec())

		if runErr := job.Run(context.Background()); runErr != nil {
			m.logger.Error("worker job failed", "job", job.Name(), "duration", time.Since(start), "error", runErr)
			return
		}

		m.logger.Info("worker job completed", "job", job.Name(), "duration", time.Since(start))
	})

	if err != nil {
		m.logger.Error("failed to register worker job", "job", job.Name(), "error", err)
		return err
	}

	m.logger.Info("worker job registered", "job", job.Name(), "spec", job.Spec())
	return nil
}

func (m *Manager) Start() {
	m.logger.Info("starting worker manager")
	m.cron.Start()
}

func (m *Manager) Stop(ctx context.Context) {
	m.logger.Info("stopping worker manager")
	stopCtx := m.cron.Stop()

	select {
	case <-stopCtx.Done():
		m.logger.Info("worker manager stopped")
	case <-ctx.Done():
		m.logger.Warn("worker manager stop interrupted", "reason", ctx.Err())
	}
}

func shutdownContext(timeoutSec int) (context.Context, context.CancelFunc) {
	if timeoutSec <= 0 {
		timeoutSec = 15
	}
	return context.WithTimeout(context.Background(), time.Duration(timeoutSec)*time.Second)
}

func StopWithTimeout(mgr *Manager, timeoutSec int) {
	ctx, cancel := shutdownContext(timeoutSec)
	defer cancel()
	mgr.Stop(ctx)
}

func LoggerFromEnv(defaultLogger *slog.Logger) *slog.Logger {
	if defaultLogger != nil {
		return defaultLogger
	}
	return slog.New(slog.NewTextHandler(os.Stdout, nil))
}
