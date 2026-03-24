package geoip

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/netip"
	"strings"
	"sync"
	"time"
	"trackion/internal/config"
)

// Location contains geo metadata that is persisted under event properties.geo.
type Location struct {
	Country     string  `json:"country"`
	CountryCode string  `json:"country_code"`
	Emoji       string  `json:"emoji,omitempty"`
	Region      string  `json:"region"`
	City        string  `json:"city"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
}

type Resolver interface {
	Resolve(ctx context.Context, ip string) (*Location, error)
}

type cacheEntry struct {
	location *Location
	expires  time.Time
}

type resolver struct {
	enabled      bool
	providerBase string
	client       *http.Client
	cacheTTL     time.Duration
	cleanupEvery time.Duration

	mu    sync.RWMutex
	cache map[string]cacheEntry
}

type ipWhoIsResponse struct {
	Success     bool   `json:"success"`
	Country     string `json:"country"`
	CountryCode string `json:"country_code"`
	Flag        struct {
		Emoji string `json:"emoji"`
	} `json:"flag"`
	Region    string  `json:"region"`
	City      string  `json:"city"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func New(cfg config.Config) Resolver {
	timeout := time.Duration(cfg.GeoLookupTimeoutMS) * time.Millisecond
	if timeout <= 0 {
		timeout = 350 * time.Millisecond
	}

	cacheTTL := time.Duration(cfg.GeoCacheTTLMin) * time.Minute
	if cacheTTL <= 0 {
		cacheTTL = 60 * time.Minute
	}

	cleanupEvery := time.Duration(cfg.GeoCleanupSec) * time.Second
	if cleanupEvery <= 0 {
		cleanupEvery = 5 * time.Minute
	}

	r := &resolver{
		enabled:      cfg.GeoLookupEnabled,
		providerBase: strings.TrimRight(cfg.GeoLookupProvider, "/"),
		client:       &http.Client{Timeout: timeout},
		cacheTTL:     cacheTTL,
		cleanupEvery: cleanupEvery,
		cache:        make(map[string]cacheEntry),
	}

	if r.providerBase == "" {
		r.providerBase = "https://ipwho.is"
	}

	go r.cleanupLoop()
	return r
}

func (r *resolver) Resolve(ctx context.Context, ip string) (*Location, error) {
	if !r.enabled {
		return nil, nil
	}

	normalized, ok := normalizePublicIP(ip)
	if !ok {
		return nil, nil
	}

	if loc, found := r.fromCache(normalized); found {
		return loc, nil
	}

	loc, err := r.fetchLocation(ctx, normalized)
	if err != nil {
		return nil, err
	}

	r.mu.Lock()
	r.cache[normalized] = cacheEntry{location: loc, expires: time.Now().Add(r.cacheTTL)}
	r.mu.Unlock()

	return loc, nil
}

func (r *resolver) fetchLocation(ctx context.Context, ip string) (*Location, error) {
	url := fmt.Sprintf("%s/%s", r.providerBase, ip)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := r.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, nil
	}

	var payload ipWhoIsResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, err
	}

	if !payload.Success {
		return nil, nil
	}

	return &Location{
		Country:     strings.TrimSpace(payload.Country),
		CountryCode: strings.TrimSpace(payload.CountryCode),
		Emoji:       strings.TrimSpace(payload.Flag.Emoji),
		Region:      strings.TrimSpace(payload.Region),
		City:        strings.TrimSpace(payload.City),
		Latitude:    payload.Latitude,
		Longitude:   payload.Longitude,
	}, nil
}

func (r *resolver) fromCache(ip string) (*Location, bool) {
	r.mu.RLock()
	entry, ok := r.cache[ip]
	r.mu.RUnlock()
	if !ok || time.Now().After(entry.expires) {
		return nil, false
	}
	return entry.location, true
}

func (r *resolver) cleanupLoop() {
	ticker := time.NewTicker(r.cleanupEvery)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()
		r.mu.Lock()
		for ip, entry := range r.cache {
			if now.After(entry.expires) {
				delete(r.cache, ip)
			}
		}
		r.mu.Unlock()
	}
}

func normalizePublicIP(raw string) (string, bool) {
	ip := strings.TrimSpace(raw)
	if ip == "" {
		return "", false
	}

	if strings.Contains(ip, ",") {
		parts := strings.Split(ip, ",")
		ip = strings.TrimSpace(parts[0])
	}

	addr, err := netip.ParseAddr(ip)
	if err != nil {
		return "", false
	}

	if !addr.IsValid() || addr.IsPrivate() || addr.IsLoopback() || addr.IsMulticast() || addr.IsUnspecified() {
		return "", false
	}

	return addr.String(), true
}
