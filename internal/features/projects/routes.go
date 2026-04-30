package projects

import (
	"trackion/internal/config"
	"trackion/internal/features/errortracking"
	"trackion/internal/features/replay"
	"trackion/internal/features/runtime"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func Routes(db *gorm.DB, cfg config.Config) *chi.Mux {
	r := chi.NewRouter()

	service := NewService(db, cfg)
	handler := NewHandler(service)

	r.Get("/", handler.ListUserProjects)
	r.Post("/", handler.CreateProject)
	r.Get("/{id}", handler.GetProjectDetails)
	r.Put("/{id}", handler.UpdateProject)
	r.Delete("/{id}", handler.DeleteProject)

	runtimeService := runtime.NewService(db, cfg)
	runtimeHandler := runtime.NewHandler(runtimeService)

	// r.Mount("/{id}/runtime", runtime.Routes(db, cfg)) // when ready
	r.Get("/{id}/runtime", runtimeHandler.GetProjectRuntime)
	r.Put("/{id}/runtime/flags/{key}", runtimeHandler.UpsertFlag)
	r.Delete("/{id}/runtime/flags/{key}", runtimeHandler.DeleteFlag)

	r.Put("/{id}/runtime/config/{key}", runtimeHandler.UpsertConfig)
	r.Delete("/{id}/runtime/config/{key}", runtimeHandler.DeleteConfig)

	replayService := replay.NewService(db)
	replayHandler := replay.NewHandler(replayService)

	// r.Mount("/{id}/replay", replay.PrivateRoutes(db)) // when ready
	r.Get("/{id}/replays", replayHandler.ListSessions)
	r.Get("/{id}/replays/{sessionId}", replayHandler.GetSession)
	r.Delete("/{id}/replays/{sessionId}", replayHandler.DeleteSession)

	errTrackingService := errortracking.NewService(db)
	errTrackingHandler := errortracking.NewHandler(errTrackingService)

	r.Get("/{id}/errors", errTrackingHandler.ListErrors)
	r.Get("/{id}/errors/{fingerprint}", errTrackingHandler.GetErrorDetail)
	r.Get("/{id}/errors/stats", errTrackingHandler.GetErrorStats)

	return r
}
