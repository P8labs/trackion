package events

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net"
	"net/http"
	"net/netip"
	"net/url"
	"strconv"
	"strings"
	"time"
	"trackion/internal/config"
	"trackion/internal/core/domain"
	"trackion/internal/core/ratelimit"
	"trackion/internal/db"
	"trackion/internal/res"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Middleware struct {
	db      *gorm.DB
	limiter ratelimit.Limiter
	cfg     config.Config
}

const (
	ProjectIdContextKey      string = "projectId"
	ProjectDomainsContextKey string = "projectDomains"
)

func NewMiddleware(db *gorm.DB) *Middleware {
	return &Middleware{
		db: db,
		limiter: ratelimit.NewInMemoryLimiter(
			60*time.Second,
			10*time.Minute,
		),
		cfg: config.Config{
			BatchProjectRPS:   10,
			BatchProjectBurst: 20,
			BatchIPRPM:        100,
			RateLimitTTLMin:   10,
			RateLimitCleanupS: 60,
		},
	}
}

func NewMiddlewareWithConfig(db *gorm.DB, cfg config.Config) *Middleware {
	cleanupEvery := time.Duration(cfg.RateLimitCleanupS) * time.Second
	ttl := time.Duration(cfg.RateLimitTTLMin) * time.Minute

	return &Middleware{
		db:      db,
		cfg:     cfg,
		limiter: ratelimit.NewInMemoryLimiter(cleanupEvery, ttl),
	}
}

// AttachProjectContext tries to resolve project context but does not reject request.
// This enables downstream middleware to fallback to IP limits for missing/invalid keys.
func (m Middleware) AttachProjectContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, ok := r.Context().Value(ProjectIdContextKey).(uuid.UUID); ok {
			next.ServeHTTP(w, r)
			return
		}

		key := extractProjectKey(r)
		if key == "" {
			next.ServeHTTP(w, r)
			return
		}

		project, err := gorm.G[db.Project](m.db).Where("api_key = ?", key).First(r.Context())

		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(r.Context(), ProjectIdContextKey, project.ID)
		ctx = context.WithValue(ctx, ProjectDomainsContextKey, project.Domains)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (m Middleware) ProjectIDValidation(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, ok := r.Context().Value(ProjectIdContextKey).(uuid.UUID); ok {
			next.ServeHTTP(w, r)
			return
		}

		key := extractProjectKey(r)

		if key == "" {
			res.Error(w, "Missing project key", 400)
			return
		}

		project, err := gorm.G[db.Project](m.db).Where("api_key = ?", key).First(r.Context())
		if err != nil {
			res.Error(w, "Invalid project key.", 400)
			return
		}

		ctx := context.WithValue(r.Context(), ProjectIdContextKey, project.ID)
		ctx = context.WithValue(ctx, ProjectDomainsContextKey, project.Domains)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (m Middleware) OriginDomainValidation(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rawDomains, _ := r.Context().Value(ProjectDomainsContextKey).([]string)
		if len(rawDomains) == 0 {
			next.ServeHTTP(w, r)
			return
		}

		requestDomain := extractRequestDomain(r)
		if requestDomain == "" {
			// Native SDK clients (mobile/game/server) typically do not send Origin/Referer.
			// If no domain metadata is present, allow the request after project-key validation.
			next.ServeHTTP(w, r)
			return
		}

		if !domain.IsAllowed(rawDomains, requestDomain) {
			res.Error(w, "Origin domain is not allowed for this project", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (m Middleware) BatchRateLimit(next http.Handler) http.Handler {
	projectRule := ratelimit.Rule{
		LimitPerWindow: m.cfg.BatchProjectRPS,
		RatePerSecond:  float64(m.cfg.BatchProjectRPS),
		Burst:          m.cfg.BatchProjectBurst,
		TTL:            time.Duration(m.cfg.RateLimitTTLMin) * time.Minute,
	}
	ipRule := ratelimit.Rule{
		LimitPerWindow: m.cfg.BatchIPRPM,
		RatePerSecond:  float64(m.cfg.BatchIPRPM) / 60.0,
		Burst:          m.cfg.BatchIPRPM,
		TTL:            time.Duration(m.cfg.RateLimitTTLMin) * time.Minute,
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := ""
		rule := ipRule

		if projectID, ok := r.Context().Value(ProjectIdContextKey).(uuid.UUID); ok {
			key = "project:" + projectID.String()
			rule = projectRule
		} else {
			clientIP := getClientIP(r)
			if clientIP == "" {
				clientIP = "unknown"
			}
			key = "ip:" + clientIP
		}

		decision := m.limiter.Allow(key, rule)
		w.Header().Set("X-RateLimit-Limit", strconv.Itoa(decision.Limit))
		w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(max(0, decision.Remaining)))

		if !decision.Allowed {
			retryAfterSec := int(math.Ceil(decision.RetryAfter.Seconds()))
			if retryAfterSec < 1 {
				retryAfterSec = 1
			}
			w.Header().Set("Retry-After", strconv.Itoa(retryAfterSec))
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			_, _ = w.Write([]byte(`{"error":"rate limit exceeded"}`))
			log.Printf("rate limit exceeded key=%s remote=%s path=%s", key, getClientIP(r), r.URL.Path)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func extractProjectKey(r *http.Request) string {
	key := strings.TrimSpace(r.Header.Get("X-Project-Key"))
	if key != "" {
		return key
	}

	if r.Body == nil {
		return ""
	}

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil || len(bodyBytes) == 0 {
		return ""
	}
	r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	var payload struct {
		ProjectKey string `json:"project_key"`
	}
	if err := json.Unmarshal(bodyBytes, &payload); err != nil {
		return ""
	}

	return strings.TrimSpace(payload.ProjectKey)
}

func getClientIP(r *http.Request) string {
	candidates := []string{
		r.Header.Get("X-Forwarded-For"),
		r.Header.Get("X-Real-IP"),
		r.RemoteAddr,
	}

	for _, raw := range candidates {
		for part := range strings.SplitSeq(raw, ",") {
			ip := strings.TrimSpace(part)
			if ip == "" {
				continue
			}

			if host, _, err := net.SplitHostPort(ip); err == nil {
				ip = host
			}

			addr, err := netip.ParseAddr(ip)
			if err != nil {
				continue
			}

			if addr.IsLoopback() {
				return fmt.Sprintf("loopback:%s", addr.String())
			}

			return addr.String()
		}
	}

	return ""
}

func extractRequestDomain(r *http.Request) string {
	candidates := []string{
		strings.TrimSpace(r.Header.Get("Origin")),
		strings.TrimSpace(r.Header.Get("Referer")),
		strings.TrimSpace(r.Header.Get("X-Trackion-Origin")),
		strings.TrimSpace(r.Header.Get("X-Trackion-Domain")),
	}

	for _, c := range candidates {
		if c == "" {
			continue
		}

		u, err := url.Parse(c)
		if err != nil || u.Host == "" {
			continue
		}

		return u.Host
	}

	return ""
}
