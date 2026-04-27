package runtime

import (
	"encoding/json"
	"sync"
	"time"
	db "trackion/internal/db/models"
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
