package runtime

import (
	"context"
	"encoding/json"
	"errors"
	"hash/fnv"
	"log"
	"maps"
	"sort"
	"strings"
	"time"
	"trackion/internal/config"
	"trackion/internal/core"
	db "trackion/internal/db/models"
	"trackion/internal/features/auth"
	"trackion/internal/features/billing"
	"trackion/internal/repo"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Service struct {
	db      *gorm.DB
	cache   *runtimeCache
	billing billing.Service
	config  config.Config
}

func NewService(db *gorm.DB, cfg config.Config) Service {
	return Service{
		db:      db,
		cache:   newRuntimeCache(30 * time.Second),
		billing: billing.NewService(db),
		config:  cfg,
	}
}

func (s *Service) GetPublicRuntime(ctx context.Context, projectID, userID string) (PublicRuntimeDTO, error) {
	projectID = strings.TrimSpace(projectID)
	if _, err := uuid.Parse(projectID); err != nil {
		return PublicRuntimeDTO{}, errors.New("invalid project_id")
	}

	entry, err := s.getRuntimeSnapshot(ctx, projectID)
	if err != nil {
		return PublicRuntimeDTO{}, err
	}

	out := PublicRuntimeDTO{
		Flags:  make(map[string]bool, len(entry.flags)),
		Config: make(map[string]json.RawMessage, len(entry.configs)),
	}

	for _, flag := range entry.flags {
		out.Flags[flag.Key] = evaluateFlag(flag, userID)
	}

	maps.Copy(out.Config, entry.configs)

	return out, nil
}

func (s *Service) GetProjectRuntime(ctx context.Context, projectID string) (ProjectRuntimeDTO, error) {
	p, err := s.ensureProjectOwnership(ctx, projectID)

	if err != nil {
		return ProjectRuntimeDTO{}, err
	}

	entry, err := s.getRuntimeSnapshot(ctx, projectID)
	if err != nil {
		return ProjectRuntimeDTO{}, err
	}

	out := ProjectRuntimeDTO{
		Project: struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		}{
			ID:   p.ID.String(),
			Name: p.Name,
		},
		Flags:   make([]FlagDTO, 0, len(entry.flags)),
		Configs: make([]ConfigDTO, 0, len(entry.configs)),
	}

	for _, f := range entry.flags {
		out.Flags = append(out.Flags, FlagDTO{
			Key:               f.Key,
			Enabled:           f.Enabled,
			RolloutPercentage: f.RolloutPercentage,
		})
	}

	configKeys := make([]string, 0, len(entry.configs))
	for key := range entry.configs {
		configKeys = append(configKeys, key)
	}
	sort.Strings(configKeys)

	for _, key := range configKeys {
		out.Configs = append(out.Configs, ConfigDTO{
			Key:   key,
			Value: entry.configs[key],
		})
	}

	return out, nil
}

func (s *Service) UpsertFlag(ctx context.Context, projectID, key string, params UpsertFlagParams) error {
	if _, err := s.ensureProjectOwnership(ctx, projectID); err != nil {
		return err
	}

	err := core.Require("flag key", key)
	if err != nil {
		return err
	}

	if s.config.IsSaaS() && params.RolloutPercentage > 0 && params.RolloutPercentage < 100 {
		if err := s.billing.CheckFeatureFlagRollout(ctx); err != nil {
			return err
		}
	}

	if params.RolloutPercentage < 0 || params.RolloutPercentage > 100 {
		return errors.New("rollout_percentage must be between 0 and 100")
	}

	projectUUID := uuid.MustParse(projectID)
	var item db.Flag

	item, err = gorm.G[db.Flag](s.db).
		Where(repo.Flag.ProjectID.Eq(projectUUID)).
		Where(repo.Flag.Key.Eq(key)).
		First(ctx)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		item = db.Flag{
			ProjectID:         projectUUID,
			Key:               key,
			Enabled:           params.Enabled,
			RolloutPercentage: params.RolloutPercentage,
		}
		return gorm.G[db.Flag](s.db).Create(ctx, &item)
	}
	if err != nil {
		return err
	}

	item.Enabled = params.Enabled
	item.RolloutPercentage = params.RolloutPercentage
	item.UpdatedAt = time.Now()
	log.Print(item)
	_, err = gorm.G[db.Flag](s.db).
		Where(repo.Flag.ID.Eq(item.ID)).Set(
		repo.Flag.Enabled.Set(params.Enabled),
		repo.Flag.RolloutPercentage.Set(params.RolloutPercentage)).
		Update(ctx)
	if err != nil {

		return err
	}

	s.cache.invalidate(projectID)
	return nil
}

func (s *Service) DeleteFlag(ctx context.Context, projectID, key string) error {
	if _, err := s.ensureProjectOwnership(ctx, projectID); err != nil {
		return err
	}

	if key == "" {
		return errors.New("flag key is required")
	}

	projectUUID := uuid.MustParse(projectID)
	if _, err := gorm.G[db.Flag](s.db).
		Where(repo.Flag.ProjectID.Eq(projectUUID)).
		Where(repo.Flag.Key.Eq(key)).
		Delete(ctx); err != nil {
		return err
	}

	s.cache.invalidate(projectID)
	return nil
}

func (s *Service) UpsertConfig(ctx context.Context, projectID, key string, params UpsertConfigParams) error {
	if _, err := s.ensureProjectOwnership(ctx, projectID); err != nil {
		return err
	}

	key = strings.TrimSpace(key)
	if key == "" {
		return errors.New("config key is required")
	}

	if s.config.IsSaaS() {
		var configCount int64
		projectUUID := uuid.MustParse(projectID)

		configs, countErr := gorm.G[db.Config](s.db).
			Where(repo.Config.ProjectID.Eq(projectUUID)).
			Find(ctx)
		if countErr != nil {
			return countErr
		}
		configCount = int64(len(configs))

		_, existingErr := gorm.G[db.Config](s.db).
			Where(repo.Config.ProjectID.Eq(projectUUID)).
			Where(repo.Config.Key.Eq(key)).
			First(ctx)
		if existingErr != nil && !errors.Is(existingErr, gorm.ErrRecordNotFound) {
			return existingErr
		}

		if errors.Is(existingErr, gorm.ErrRecordNotFound) {
			if err := s.billing.CheckConfigLimit(ctx, projectUUID, int(configCount)); err != nil {
				return err
			}
		}
	}

	value := strings.TrimSpace(string(params.Value))
	if value == "" {
		return errors.New("config value is required")
	}

	if !json.Valid(params.Value) {
		return errors.New("config value must be valid JSON")
	}

	if err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		projectUUID := uuid.MustParse(projectID)

		var item db.Config
		item, err := gorm.G[db.Config](tx).
			Where(repo.Config.ProjectID.Eq(projectUUID)).
			Where(repo.Config.Key.Eq(key)).
			First(ctx)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			item = db.Config{
				ProjectID: projectUUID,
				Key:       key,
				Value:     datatypes.JSON(params.Value),
			}
			return gorm.G[db.Config](tx).Create(ctx, &item)
		}
		if err != nil {
			return err
		}

		item.Value = datatypes.JSON(params.Value)
		item.UpdatedAt = time.Now()
		_, err = gorm.G[db.Config](tx).
			Where(repo.Config.ID.Eq(item.ID)).
			Updates(ctx, item)
		return err
	}); err != nil {
		return err
	}

	s.cache.invalidate(projectID)
	return nil
}

func (s *Service) DeleteConfig(ctx context.Context, projectID, key string) error {
	if _, err := s.ensureProjectOwnership(ctx, projectID); err != nil {
		return err
	}

	if key == "" {
		return errors.New("config key is required")
	}

	projectUUID := uuid.MustParse(projectID)
	if _, err := gorm.G[db.Config](s.db).
		Where(repo.Config.ProjectID.Eq(projectUUID)).
		Where(repo.Config.Key.Eq(key)).
		Delete(ctx); err != nil {
		return err
	}

	s.cache.invalidate(projectID)
	return nil
}

func (s *Service) ensureProjectOwnership(ctx context.Context, projectID string) (db.Project, error) {
	userIDRaw, ok := ctx.Value(auth.UserIdContextKey).(string)

	if !ok || userIDRaw == "" {
		return db.Project{}, errors.New("unauthorized")
	}

	projectUUID, err := uuid.Parse(projectID)
	if err != nil {
		return db.Project{}, errors.New("invalid project id")
	}

	userID, err := uuid.Parse(userIDRaw)
	if err != nil {
		return db.Project{}, errors.New("invalid user id")
	}

	p, err := gorm.G[db.Project](s.db).
		Select("id, name").
		Where(repo.Project.ID.Eq(projectUUID)).
		Where(repo.Project.UserID.Eq(userID)).
		First(ctx)

	if err != nil {
		return db.Project{}, errors.New("project not found")
	}

	return p, nil
}

func (s *Service) getRuntimeSnapshot(ctx context.Context, projectID string) (runtimeCacheEntry, error) {
	if entry, ok := s.cache.get(projectID); ok {
		return entry, nil
	}

	projectUUID, err := uuid.Parse(projectID)
	if err != nil {
		return runtimeCacheEntry{}, errors.New("project not found")
	}

	if _, err := gorm.G[db.Project](s.db).
		Select("id").
		Where(repo.Project.ID.Eq(projectUUID)).
		First(ctx); err != nil {
		return runtimeCacheEntry{}, errors.New("project not found")
	}

	flags, err := gorm.G[db.Flag](s.db).
		Where(repo.Flag.ProjectID.Eq(projectUUID)).
		Order(repo.Flag.Key).
		Find(ctx)
	if err != nil {
		return runtimeCacheEntry{}, err
	}

	configRows, err := gorm.G[db.Config](s.db).Where(repo.Config.ProjectID.Eq(projectUUID)).Find(ctx)
	if err != nil {
		return runtimeCacheEntry{}, err
	}

	configs := make(map[string]json.RawMessage, len(configRows))
	for _, cfg := range configRows {
		if len(cfg.Value) == 0 {
			configs[cfg.Key] = json.RawMessage("null")
			continue
		}
		configs[cfg.Key] = json.RawMessage(cfg.Value)
	}

	entry := runtimeCacheEntry{flags: flags, configs: configs}
	s.cache.set(projectID, entry)
	return entry, nil
}

func evaluateFlag(flag db.Flag, userID string) bool {
	if !flag.Enabled {
		return false
	}

	if flag.RolloutPercentage <= 0 {
		return false
	}

	if flag.RolloutPercentage >= 100 {
		return true
	}

	userID = strings.TrimSpace(userID)
	if userID == "" {
		return false
	}

	h := fnv.New32a()
	_, _ = h.Write([]byte(flag.Key + ":" + userID))
	bucket := int(h.Sum32() % 100)
	return bucket < flag.RolloutPercentage
}
