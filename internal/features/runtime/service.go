package runtime

import (
	"context"
	"encoding/json"
	"errors"
	"hash/fnv"
	"maps"
	"sort"
	"strings"
	"sync"
	"time"
	"trackion/internal/config"
	"trackion/internal/db"
	"trackion/internal/features/auth"
	"trackion/internal/features/billing"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type runtimeCacheEntry struct {
	expiresAt time.Time
	flags     []db.Flag
	configs   map[string]json.RawMessage
}

type runtimeCache struct {
	mu    sync.RWMutex
	ttl   time.Duration
	items map[string]runtimeCacheEntry
}

func newRuntimeCache(ttl time.Duration) *runtimeCache {
	return &runtimeCache{
		ttl:   ttl,
		items: make(map[string]runtimeCacheEntry),
	}
}

func (c *runtimeCache) get(projectID string) (runtimeCacheEntry, bool) {
	c.mu.RLock()
	entry, ok := c.items[projectID]
	c.mu.RUnlock()
	if !ok || time.Now().After(entry.expiresAt) {
		if ok {
			c.mu.Lock()
			delete(c.items, projectID)
			c.mu.Unlock()
		}
		return runtimeCacheEntry{}, false
	}
	return entry, true
}

func (c *runtimeCache) set(projectID string, entry runtimeCacheEntry) {
	entry.expiresAt = time.Now().Add(c.ttl)
	c.mu.Lock()
	c.items[projectID] = entry
	c.mu.Unlock()
}

func (c *runtimeCache) invalidate(projectID string) {
	c.mu.Lock()
	delete(c.items, projectID)
	c.mu.Unlock()
}

type FlagDTO struct {
	Key               string `json:"key"`
	Enabled           bool   `json:"enabled"`
	RolloutPercentage int    `json:"rollout_percentage"`
}

type ConfigDTO struct {
	Key   string          `json:"key"`
	Value json.RawMessage `json:"value"`
}

type ProjectRuntimeDTO struct {
	Flags   []FlagDTO   `json:"flags"`
	Configs []ConfigDTO `json:"configs"`
}

type PublicRuntimeDTO struct {
	Flags  map[string]bool            `json:"flags"`
	Config map[string]json.RawMessage `json:"config"`
}

type UpsertFlagParams struct {
	Enabled           bool `json:"enabled"`
	RolloutPercentage int  `json:"rollout_percentage"`
}

type UpsertConfigParams struct {
	Value json.RawMessage `json:"value"`
}

type Service interface {
	GetPublicRuntime(ctx context.Context, projectID, userID string) (PublicRuntimeDTO, error)
	GetProjectRuntime(ctx context.Context, projectID string) (ProjectRuntimeDTO, error)
	UpsertFlag(ctx context.Context, projectID, key string, params UpsertFlagParams) error
	DeleteFlag(ctx context.Context, projectID, key string) error
	UpsertConfig(ctx context.Context, projectID, key string, params UpsertConfigParams) error
	DeleteConfig(ctx context.Context, projectID, key string) error
}

type service struct {
	db      *gorm.DB
	cache   *runtimeCache
	billing billing.Service
	config  config.Config
}

func NewService(db *gorm.DB, cfg config.Config) Service {
	return &service{
		db:      db,
		cache:   newRuntimeCache(30 * time.Second),
		billing: billing.NewService(db),
		config:  cfg,
	}
}

func (s *service) GetPublicRuntime(ctx context.Context, projectID, userID string) (PublicRuntimeDTO, error) {
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

func (s *service) GetProjectRuntime(ctx context.Context, projectID string) (ProjectRuntimeDTO, error) {
	if err := s.ensureProjectOwnership(ctx, projectID); err != nil {
		return ProjectRuntimeDTO{}, err
	}

	entry, err := s.getRuntimeSnapshot(ctx, projectID)
	if err != nil {
		return ProjectRuntimeDTO{}, err
	}

	out := ProjectRuntimeDTO{
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

func (s *service) UpsertFlag(ctx context.Context, projectID, key string, params UpsertFlagParams) error {
	if err := s.ensureProjectOwnership(ctx, projectID); err != nil {
		return err
	}

	key = strings.TrimSpace(key)
	if key == "" {
		return errors.New("flag key is required")
	}

	if s.config.IsSaaS() && params.RolloutPercentage > 0 && params.RolloutPercentage < 100 {
		if err := s.billing.CheckFeatureFlagRollout(ctx); err != nil {
			return err
		}
	}

	if params.RolloutPercentage < 0 || params.RolloutPercentage > 100 {
		return errors.New("rollout_percentage must be between 0 and 100")
	}

	if err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var item db.Flag
		err := tx.Where("project_id = ? AND key = ?", projectID, key).First(&item).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			item = db.Flag{
				ProjectID:         uuid.MustParse(projectID),
				Key:               key,
				Enabled:           params.Enabled,
				RolloutPercentage: params.RolloutPercentage,
			}
			return tx.Create(&item).Error
		}
		if err != nil {
			return err
		}

		item.Enabled = params.Enabled
		item.RolloutPercentage = params.RolloutPercentage
		item.UpdatedAt = time.Now()
		return tx.Save(&item).Error
	}); err != nil {
		return err
	}

	s.cache.invalidate(projectID)
	return nil
}

func (s *service) DeleteFlag(ctx context.Context, projectID, key string) error {
	if err := s.ensureProjectOwnership(ctx, projectID); err != nil {
		return err
	}

	if key == "" {
		return errors.New("flag key is required")
	}

	if err := s.db.WithContext(ctx).Where("project_id = ? AND key = ?", projectID, key).Delete(&db.Flag{}).Error; err != nil {
		return err
	}

	s.cache.invalidate(projectID)
	return nil
}

func (s *service) UpsertConfig(ctx context.Context, projectID, key string, params UpsertConfigParams) error {
	if err := s.ensureProjectOwnership(ctx, projectID); err != nil {
		return err
	}

	key = strings.TrimSpace(key)
	if key == "" {
		return errors.New("config key is required")
	}

	if s.config.IsSaaS() {
		var configCount int64
		countErr := s.db.WithContext(ctx).Model(&db.Config{}).Where("project_id = ?", projectID).Count(&configCount).Error
		if countErr != nil {
			return countErr
		}

		var existingConfig db.Config
		existingErr := s.db.WithContext(ctx).Where("project_id = ? AND key = ?", projectID, key).First(&existingConfig).Error
		if existingErr != nil && !errors.Is(existingErr, gorm.ErrRecordNotFound) {
			return existingErr
		}

		if errors.Is(existingErr, gorm.ErrRecordNotFound) {
			projectUUID := uuid.MustParse(projectID)
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
		var item db.Config
		err := tx.Where("project_id = ? AND key = ?", projectID, key).First(&item).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			item = db.Config{
				ProjectID: uuid.MustParse(projectID),
				Key:       key,
				Value:     datatypes.JSON(params.Value),
			}
			return tx.Create(&item).Error
		}
		if err != nil {
			return err
		}

		item.Value = datatypes.JSON(params.Value)
		item.UpdatedAt = time.Now()
		return tx.Save(&item).Error
	}); err != nil {
		return err
	}

	s.cache.invalidate(projectID)
	return nil
}

func (s *service) DeleteConfig(ctx context.Context, projectID, key string) error {
	if err := s.ensureProjectOwnership(ctx, projectID); err != nil {
		return err
	}

	if key == "" {
		return errors.New("config key is required")
	}

	if err := s.db.WithContext(ctx).Where("project_id = ? AND key = ?", projectID, key).Delete(&db.Config{}).Error; err != nil {
		return err
	}

	s.cache.invalidate(projectID)
	return nil
}

func (s *service) ensureProjectOwnership(ctx context.Context, projectID string) error {
	userIDRaw, ok := ctx.Value(auth.UserIdContextKey).(string)
	if !ok || userIDRaw == "" {
		return errors.New("unauthorized")
	}

	if _, err := uuid.Parse(projectID); err != nil {
		return errors.New("invalid project id")
	}

	if auth.SystemUserID == userIDRaw {
		_, err := gorm.G[db.Project](s.db).Select("id").Where("id = ?", projectID).First(ctx)
		if err != nil {
			return errors.New("project not found")
		}
		return nil
	}

	userID, err := uuid.Parse(userIDRaw)
	if err != nil {
		return errors.New("invalid user id")
	}

	_, err = gorm.G[db.Project](s.db).Select("id").Where("id = ? AND user_id = ?", projectID, userID).First(ctx)
	if err != nil {
		return errors.New("project not found")
	}

	return nil
}

func (s *service) getRuntimeSnapshot(ctx context.Context, projectID string) (runtimeCacheEntry, error) {
	if entry, ok := s.cache.get(projectID); ok {
		return entry, nil
	}

	if _, err := gorm.G[db.Project](s.db).Select("id").Where("id = ?", projectID).First(ctx); err != nil {
		return runtimeCacheEntry{}, errors.New("project not found")
	}

	flags, err := gorm.G[db.Flag](s.db).Where("project_id = ?", projectID).Order("key ASC").Find(ctx)
	if err != nil {
		return runtimeCacheEntry{}, err
	}

	configRows, err := gorm.G[db.Config](s.db).Where("project_id = ?", projectID).Find(ctx)
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
