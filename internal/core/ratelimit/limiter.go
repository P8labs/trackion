package ratelimit

import (
	"hash/fnv"
	"math"
	"sync"
	"time"
)

type Rule struct {
	LimitPerWindow int
	RatePerSecond  float64
	Burst          int
	TTL            time.Duration
}

type Decision struct {
	Allowed    bool
	Limit      int
	Remaining  int
	RetryAfter time.Duration
}

type Limiter interface {
	Allow(key string, rule Rule) Decision
}

type bucket struct {
	tokens     float64
	lastRefill time.Time
	lastSeen   time.Time
}

type shard struct {
	mu      sync.Mutex
	buckets map[string]bucket
}

type inMemoryLimiter struct {
	shards          []shard
	cleanupEvery    time.Duration
	defaultTTL      time.Duration
	stopCleanupChan chan struct{}
}

const defaultShardCount = 64

func NewInMemoryLimiter(cleanupEvery, defaultTTL time.Duration) Limiter {
	if cleanupEvery <= 0 {
		cleanupEvery = 60 * time.Second
	}
	if defaultTTL <= 0 {
		defaultTTL = 10 * time.Minute
	}

	l := &inMemoryLimiter{
		shards:          make([]shard, defaultShardCount),
		cleanupEvery:    cleanupEvery,
		defaultTTL:      defaultTTL,
		stopCleanupChan: make(chan struct{}),
	}

	for i := range l.shards {
		l.shards[i] = shard{buckets: make(map[string]bucket)}
	}

	go l.cleanupLoop()
	return l
}

func (l *inMemoryLimiter) Allow(key string, rule Rule) Decision {
	now := time.Now()
	if rule.TTL <= 0 {
		rule.TTL = l.defaultTTL
	}
	if rule.RatePerSecond <= 0 {
		return Decision{Allowed: false, Limit: rule.LimitPerWindow, Remaining: 0, RetryAfter: time.Second}
	}
	if rule.Burst <= 0 {
		rule.Burst = 1
	}

	s := l.getShard(key)
	s.mu.Lock()
	defer s.mu.Unlock()

	b, ok := s.buckets[key]
	if !ok {
		b = bucket{
			tokens:     float64(rule.Burst),
			lastRefill: now,
			lastSeen:   now,
		}
	}

	elapsed := now.Sub(b.lastRefill).Seconds()
	if elapsed > 0 {
		b.tokens = math.Min(float64(rule.Burst), b.tokens+elapsed*rule.RatePerSecond)
		b.lastRefill = now
	}
	b.lastSeen = now

	decision := Decision{Allowed: false, Limit: rule.LimitPerWindow, Remaining: 0}

	if b.tokens >= 1 {
		b.tokens -= 1
		remaining := int(math.Floor(b.tokens))
		if remaining < 0 {
			remaining = 0
		}
		decision.Allowed = true
		decision.Remaining = remaining
		s.buckets[key] = b
		return decision
	}

	need := 1 - b.tokens
	if need < 0 {
		need = 0
	}
	waitSec := need / rule.RatePerSecond
	if waitSec <= 0 {
		waitSec = 1
	}
	decision.RetryAfter = time.Duration(math.Ceil(waitSec)) * time.Second
	s.buckets[key] = b
	return decision
}

func (l *inMemoryLimiter) cleanupLoop() {
	t := time.NewTicker(l.cleanupEvery)
	defer t.Stop()

	for {
		select {
		case <-t.C:
			l.cleanupOnce()
		case <-l.stopCleanupChan:
			return
		}
	}
}

func (l *inMemoryLimiter) cleanupOnce() {
	now := time.Now()
	for i := range l.shards {
		s := &l.shards[i]
		s.mu.Lock()
		for key, b := range s.buckets {
			if now.Sub(b.lastSeen) > l.defaultTTL {
				delete(s.buckets, key)
			}
		}
		s.mu.Unlock()
	}
}

func (l *inMemoryLimiter) getShard(key string) *shard {
	h := fnv.New32a()
	_, _ = h.Write([]byte(key))
	idx := int(h.Sum32()) % len(l.shards)
	return &l.shards[idx]
}
