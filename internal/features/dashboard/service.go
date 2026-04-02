package dashboard

import (
	"context"
	"fmt"
	"net/url"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type TimeSeriesData struct {
	Date   string `json:"date"`
	Events int64  `json:"events"`
}

type EventBreakdownItem struct {
	Name  string `json:"name"`
	Count int64  `json:"count"`
	Color string `json:"color"`
}

type DashboardStats struct {
	TotalEvents  int64   `json:"total_events"`
	Views        int64   `json:"views"`
	UniqueViews  int64   `json:"unique_views"`
	AvgTimeSpent float64 `json:"avg_time_spent_seconds"`
}

type ChartDataPoint struct {
	Period string `json:"period"`
	Count  int64  `json:"count"`
}

type AreaChartDataPoint struct {
	Period  string `json:"period"`
	Desktop int64  `json:"desktop"`
	Mobile  int64  `json:"mobile"`
}

type BreakdownData struct {
	Devices   []BreakdownItem `json:"devices"`
	Browsers  []BreakdownItem `json:"browsers"`
	Referrers []BreakdownItem `json:"referrers"`
	UTM       []UTMBreakdown  `json:"utm"`
	TopPages  []PageBreakdown `json:"top_pages"`
}

type BreakdownItem struct {
	Name        string `json:"name"`
	Count       int64  `json:"count"`
	Color       string `json:"color,omitempty"`
	CountryCode string `json:"country_code,omitempty"`
	Emoji       string `json:"emoji,omitempty"`
}

type CountryMapEntry struct {
	Name           string `json:"name"`
	Count          int64  `json:"count"`
	CountryCode    string `json:"country_code,omitempty"`
	Emoji          string `json:"emoji,omitempty"`
	NormalizedName string `json:"normalized_name"`
}

type CountryMapData struct {
	Countries []CountryMapEntry          `json:"countries"`
	MaxCount  int64                      `json:"max_count"`
	ByCode    map[string]CountryMapEntry `json:"by_code"`
	ByName    map[string]CountryMapEntry `json:"by_name"`
}

type UTMBreakdown struct {
	Source   string `json:"source"`
	Medium   string `json:"medium"`
	Campaign string `json:"campaign"`
	Count    int64  `json:"count"`
}

type PageBreakdown struct {
	Path        string `json:"path"`
	Count       int64  `json:"count"`
	UniqueViews int64  `json:"unique_views"`
}

type RecentEventData struct {
	ID          int64       `json:"id"`
	EventName   string      `json:"event_name"`
	EventType   string      `json:"event_type,omitempty"`
	UserID      string      `json:"user_id,omitempty"`
	SessionID   string      `json:"session_id"`
	Platform    string      `json:"platform,omitempty"`
	Device      string      `json:"device,omitempty"`
	OSVersion   string      `json:"os_version,omitempty"`
	AppVersion  string      `json:"app_version,omitempty"`
	Browser     string      `json:"browser,omitempty"`
	PagePath    string      `json:"page_path,omitempty"`
	PageTitle   string      `json:"page_title,omitempty"`
	Referrer    string      `json:"referrer,omitempty"`
	UTMSource   string      `json:"utm_source,omitempty"`
	UTMMedium   string      `json:"utm_medium,omitempty"`
	UTMCampaign string      `json:"utm_campaign,omitempty"`
	Properties  interface{} `json:"properties,omitempty"`
	CreatedAt   time.Time   `json:"created_at"`
}

type PaginatedEventsResponse struct {
	Events     []RecentEventData `json:"events"`
	Total      int64             `json:"total"`
	Page       int32             `json:"page"`
	PageSize   int32             `json:"page_size"`
	TotalPages int32             `json:"total_pages"`
}

type DashboardCounts struct {
	TotalEvents         int64   `json:"total_events"`
	Views               int64   `json:"views"`
	UniqueViews         int64   `json:"unique_views"`
	AvgTimeSpentSeconds float64 `json:"avg_time_spent_seconds"`
}

type ChartDataRequest struct {
	TimeRange   string     `json:"time_range"`           // "30m", "1h", "24h", "7d", "30d", "custom"
	EventFilter string     `json:"event_filter"`         // "" for all, specific event name
	StartTime   *time.Time `json:"start_time,omitempty"` // for custom range
	EndTime     *time.Time `json:"end_time,omitempty"`   // for custom range
}

type DeviceAnalyticsData struct {
	Devices  []BreakdownItem `json:"devices"`
	Browsers []BreakdownItem `json:"browsers"`
}

type TrafficSourcesData struct {
	Referrers  []BreakdownItem `json:"referrers"`
	Countries  []BreakdownItem `json:"countries"`
	UTMSources []BreakdownItem `json:"utm_sources"`
	UTMMediums []BreakdownItem `json:"utm_mediums"`
}

type TopPage struct {
	Path           string  `json:"path"`
	TotalViews     int64   `json:"total_views"`
	UniqueVisitors int64   `json:"unique_visitors"`
	AvgTimeSeconds float64 `json:"avg_time_seconds"`
}

type TrafficHeatmapStats struct {
	Today      int64 `json:"today"`
	WeeklyAvg  int64 `json:"weekly_avg"`
	MonthlyAvg int64 `json:"monthly_avg"`
}

type TrafficHeatmapData struct {
	DayHour  [][]int64           `json:"day_hour"`
	MonthDay [][]int64           `json:"month_day"`
	Stats    TrafficHeatmapStats `json:"stats"`
}

type Service interface {
	GetDashboardCounts(ctx context.Context, projectId string) (*DashboardCounts, error)
	GetChartDataFlexible(ctx context.Context, projectId string, request ChartDataRequest) ([]ChartDataPoint, error)
	GetAreaChartData(ctx context.Context, projectId string, timeRange string, eventFilter string) ([]AreaChartDataPoint, error)
	GetDeviceAnalytics(ctx context.Context, projectId string) (*DeviceAnalyticsData, error)
	GetTrafficSources(ctx context.Context, projectId string) (*TrafficSourcesData, error)
	GetTopPages(ctx context.Context, projectId string) ([]TopPage, error)
	GetRecentEventsFormatted(ctx context.Context, projectId string, limit int32) ([]RecentEventData, error)
	GetRecentEventsPaginated(ctx context.Context, projectId string, page, pageSize int32) (*PaginatedEventsResponse, error)
	GetOnlineUsers(ctx context.Context, projectId string) (int64, error)
	GetCountryData(ctx context.Context, projectId string) ([]BreakdownItem, error)
	GetCountryMapData(ctx context.Context, projectId string) (*CountryMapData, error)
	GetTrafficHeatmap(ctx context.Context, projectId string) (*TrafficHeatmapData, error)
}

type svc struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) Service {
	return &svc{db: db}
}

var colorMap = map[string]string{
	"page.view":       "#14b8a6",
	"page.time_spent": "#f59e0b",
	"page.click":      "#ef4444",
	"custom":          "#8b5cf6",
}

var deviceColors = []string{
	"#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16",
}

var nonAlnumCountryName = regexp.MustCompile(`[^a-z0-9]+`)

func formatTimeSpent(hours int64) string {
	if hours == 0 {
		return "0m"
	}
	minutes := (hours * 60) % 60
	if hours > 0 {
		if minutes > 0 {
			return fmt.Sprintf("%dh %dm", hours, minutes)
		}
		return fmt.Sprintf("%dh", hours)
	}
	return fmt.Sprintf("%dm", minutes)
}

func parseTimeRange(timeRange string) (time.Time, string) {
	now := time.Now()

	switch timeRange {
	case "30m":
		return now.Add(-30 * time.Minute), "minute"
	case "1h":
		return now.Add(-1 * time.Hour), "minute"
	case "24h":
		return now.Add(-24 * time.Hour), "hour"
	case "7d":
		return now.Add(-7 * 24 * time.Hour), "day"
	case "30d":
		return now.Add(-30 * 24 * time.Hour), "day"
	default: // "today"
		return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()), "hour"
	}
}

func formatPeriod(period time.Time, granularity string) string {
	switch granularity {
	case "minute":
		return period.Format("15:04")
	case "hour":
		return period.Format("15:00")
	case "day":
		return period.Format("Jan 02")
	case "week":
		return period.Format("Jan 02")
	case "month":
		return period.Format("Jan 2006")
	case "year":
		return period.Format("2006")
	default:
		return period.Format("Jan 02")
	}
}

func (s *svc) GetDashboardCounts(ctx context.Context, projectId string) (*DashboardCounts, error) {
	projectUUID := uuid.MustParse(projectId)

	type dashboardRow struct {
		TotalEvents       int64
		PageViews         int64
		UniqueViews       int64
		TotalTimeMs       int64
		TimeSpentSessions int64
	}
	var row dashboardRow

	err := s.db.WithContext(ctx).
		Table("events").
		Select(`
			COUNT(*) AS total_events,

			COUNT(*) FILTER (WHERE event_name = 'page.view') AS page_views,

			COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page.view') AS unique_views,

			COALESCE(SUM(
				(properties->>'duration_ms')::bigint
			) FILTER (WHERE event_name = 'page.time_spent'), 0) AS total_time_ms,

			COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page.time_spent') AS time_spent_sessions
		`).
		Where("project_id = ?", projectUUID).
		Scan(&row).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get dashboard counts: %w", err)
	}

	avgTimeSpentSeconds := 0.0
	if row.TimeSpentSessions > 0 {
		avgTimeSpentSeconds = float64(row.TotalTimeMs) /
			float64(row.TimeSpentSessions) /
			1000.0
	}

	return &DashboardCounts{
		TotalEvents:         row.TotalEvents,
		Views:               row.PageViews,
		UniqueViews:         row.UniqueViews,
		AvgTimeSpentSeconds: avgTimeSpentSeconds,
	}, nil
}

func (s *svc) GetChartDataFlexible(ctx context.Context, projectId string, request ChartDataRequest) ([]ChartDataPoint, error) {
	projectUUID := uuid.MustParse(projectId)

	type chartRow struct {
		Period time.Time
		Count  int64
	}

	var startTime time.Time
	var endTime *time.Time
	var granularity string

	if request.TimeRange == "custom" && request.StartTime != nil {
		startTime = *request.StartTime
		endTime = request.EndTime

		if request.EndTime != nil {
			duration := request.EndTime.Sub(startTime)
			switch {
			case duration <= 2*time.Hour:
				granularity = "minute"
			case duration <= 48*time.Hour:
				granularity = "hour"
			default:
				granularity = "day"
			}
		} else {
			granularity = "hour"
		}
	} else {
		startTime, granularity = parseTimeRange(request.TimeRange)
	}

	var rows []chartRow

	query := s.db.WithContext(ctx).
		Table("events").
		Select("DATE_TRUNC(?, created_at)::timestamptz AS period, COUNT(*) AS count", granularity).
		Where("project_id = ?", projectUUID).
		Where("created_at >= ?", startTime)

	if endTime != nil {
		query = query.Where("created_at <= ?", *endTime)
	}

	if request.EventFilter != "" {
		query = query.Where("event_name = ?", request.EventFilter)
	}

	err := query.
		Group("period").
		Order("period ASC").
		Scan(&rows).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get chart data: %w", err)
	}

	result := make([]ChartDataPoint, len(rows))
	for i, r := range rows {
		result[i] = ChartDataPoint{
			Period: formatPeriod(r.Period, granularity),
			Count:  r.Count,
		}
	}

	return result, nil
}

func (s *svc) GetDeviceAnalytics(ctx context.Context, projectId string) (*DeviceAnalyticsData, error) {
	projectUUID := uuid.MustParse(projectId)

	var deviceRows []struct {
		Name  string
		Count int64
	}

	err := s.db.WithContext(ctx).
		Table("events").
		Select("COALESCE(device, 'unknown') AS name, COUNT(*) AS count").
		Where("project_id = ?", projectUUID).
		Group("name").
		Order("count DESC").
		Scan(&deviceRows).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get device analytics: %w", err)
	}

	devices := make([]BreakdownItem, len(deviceRows))
	for i, d := range deviceRows {
		devices[i] = BreakdownItem{
			Name:  d.Name,
			Count: d.Count,
			Color: deviceColors[i%len(deviceColors)],
		}
	}

	var browserRows []struct {
		Name  string
		Count int64
	}

	err = s.db.WithContext(ctx).
		Table("events").
		Select("COALESCE(browser, 'unknown') AS name, COUNT(*) AS count").
		Where("project_id = ?", projectUUID).
		Group("name").
		Order("count DESC").
		Scan(&browserRows).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get browser analytics: %w", err)
	}

	browsers := make([]BreakdownItem, len(browserRows))
	for i, b := range browserRows {
		browsers[i] = BreakdownItem{
			Name:  b.Name,
			Count: b.Count,
			Color: deviceColors[i%len(deviceColors)],
		}
	}

	return &DeviceAnalyticsData{
		Devices:  devices,
		Browsers: browsers,
	}, nil
}

func (s *svc) GetTrafficSources(ctx context.Context, projectId string) (*TrafficSourcesData, error) {
	projectUUID := uuid.MustParse(projectId)

	// --- Referrers (raw) ---
	var refRows []struct {
		Referrer *string
		Count    int64
	}

	err := s.db.WithContext(ctx).
		Table("events").
		Select("referrer, COUNT(*) as count").
		Where("project_id = ?", projectUUID).
		Group("referrer").
		Scan(&refRows).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get referrers: %w", err)
	}

	referrerCounts := map[string]int64{}
	for _, r := range refRows {
		ref := deref(r.Referrer)
		source := classifyReferrer(ref)
		referrerCounts[source] += r.Count
	}

	// --- Countries ---
	var countryRows []struct {
		Country *string
		Count   int64
	}

	err = s.db.WithContext(ctx).
		Table("events").
		Select(`
		COALESCE(NULLIF(properties->'geo'->>'country', ''), 'Unknown') AS country,
		COUNT(*) as count
	`).
		Where("project_id = ?", projectUUID).
		Group("country").
		Order("count DESC").
		Scan(&countryRows).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get countries: %w", err)
	}

	countryCounts := map[string]int64{}
	for _, c := range countryRows {
		name := strings.TrimSpace(deref(c.Country))
		if name == "" {
			name = "Unknown"
		}
		countryCounts[name] = c.Count
	}

	// --- UTM Source ---
	var utmSourceRows []struct {
		Name  *string
		Count int64
	}

	err = s.db.WithContext(ctx).
		Table("events").
		Select("utm_source as name, COUNT(*) as count").
		Where("project_id = ?", projectUUID).
		Group("name").
		Scan(&utmSourceRows).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get utm sources: %w", err)
	}

	utmSourceCounts := map[string]int64{}
	for _, u := range utmSourceRows {
		name := strings.TrimSpace(deref(u.Name))
		if name == "" {
			name = "None"
		}
		utmSourceCounts[name] = u.Count
	}

	// --- UTM Medium ---
	var utmMediumRows []struct {
		Name  *string
		Count int64
	}

	err = s.db.WithContext(ctx).
		Table("events").
		Select("utm_medium as name, COUNT(*) as count").
		Where("project_id = ?", projectUUID).
		Group("name").
		Scan(&utmMediumRows).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get utm mediums: %w", err)
	}

	utmMediumCounts := map[string]int64{}
	for _, u := range utmMediumRows {
		name := strings.TrimSpace(deref(u.Name))
		if name == "" {
			name = "None"
		}
		utmMediumCounts[name] = u.Count
	}

	return &TrafficSourcesData{
		Referrers:  toBreakdownItems(referrerCounts),
		Countries:  toBreakdownItems(countryCounts),
		UTMSources: toBreakdownItems(utmSourceCounts),
		UTMMediums: toBreakdownItems(utmMediumCounts),
	}, nil
}

func classifyReferrer(raw string) string {
	host := normalizeReferrerHost(raw)
	if host == "" {
		return "Direct"
	}

	known := map[string]string{
		"google.":     "Google",
		"bing.":       "Bing",
		"duckduckgo.": "DuckDuckGo",
		"yahoo.":      "Yahoo",
		"baidu.":      "Baidu",
		"yandex.":     "Yandex",
		"youtube.":    "YouTube",
		"facebook.":   "Facebook",
		"instagram.":  "Instagram",
		"linkedin.":   "LinkedIn",
		"reddit.":     "Reddit",
		"github.":     "GitHub",
		"whatsapp.":   "WhatsApp",
		"telegram.":   "Telegram",
		"discord.":    "Discord",
		"slack.":      "Slack",
		"peerlist.":   "Peerlist",
	}

	if host == "t.co" || strings.Contains(host, "twitter.") || strings.Contains(host, "x.com") {
		return "X (Twitter)"
	}

	for needle, label := range known {
		if strings.Contains(host, needle) {
			return label
		}
	}

	return host
}

func normalizeReferrerHost(raw string) string {
	value := strings.TrimSpace(raw)
	if value == "" {
		return ""
	}

	parsed, err := url.Parse(value)
	if err != nil || parsed.Host == "" {
		parsed, err = url.Parse("https://" + value)
		if err != nil {
			return ""
		}
	}

	host := strings.ToLower(strings.TrimSpace(parsed.Hostname()))
	host = strings.TrimPrefix(host, "www.")
	return host
}

func toBreakdownItems(counts map[string]int64) []BreakdownItem {
	items := make([]BreakdownItem, 0, len(counts))
	for name, count := range counts {
		items = append(items, BreakdownItem{Name: name, Count: count})
	}

	sort.Slice(items, func(i, j int) bool {
		if items[i].Count == items[j].Count {
			return items[i].Name < items[j].Name
		}
		return items[i].Count > items[j].Count
	})

	for i := range items {
		items[i].Color = deviceColors[i%len(deviceColors)]
	}

	return items
}

type topPageRow struct {
	Path           *string
	TotalViews     int64
	UniqueVisitors int64
	AvgTimeSeconds *float64
}

func (s *svc) GetTopPages(ctx context.Context, projectId string) ([]TopPage, error) {
	projectUUID := uuid.MustParse(projectId)

	var rows []topPageRow

	err := s.db.WithContext(ctx).
		Table("events").
		Select(`
			page_path AS path,
			COUNT(*) FILTER (WHERE event_name = 'page.view') AS total_views,
			COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page.view') AS unique_visitors,
			AVG((properties->>'duration_ms')::float) FILTER (WHERE event_name = 'page.time_spent') / 1000 AS avg_time_seconds
		`).
		Where("project_id = ?", projectUUID).
		Where("page_path IS NOT NULL").
		Group("path").
		Order("total_views DESC").
		Limit(10).
		Scan(&rows).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get top pages: %w", err)
	}

	result := make([]TopPage, len(rows))

	for i, r := range rows {
		result[i] = TopPage{
			Path:           deref(r.Path),
			TotalViews:     r.TotalViews,
			UniqueVisitors: r.UniqueVisitors,
			AvgTimeSeconds: floatOrZero(r.AvgTimeSeconds),
		}
	}

	return result, nil
}

func (s *svc) GetRecentEventsFormatted(ctx context.Context, projectId string, limit int32) ([]RecentEventData, error) {
	projectUUID := uuid.MustParse(projectId)

	var rows []struct {
		ID          int64
		EventName   string
		EventType   *string
		UserID      *string
		SessionID   *string
		Platform    *string
		Device      *string
		OSVersion   *string
		AppVersion  *string
		Browser     *string
		PagePath    *string
		PageTitle   *string
		Referrer    string
		UTMSource   *string
		UTMMedium   *string
		UTMCampaign *string
		Properties  datatypes.JSON
		CreatedAt   time.Time
	}

	err := s.db.WithContext(ctx).
		Table("events").
		Select(`
			id,
			event_name,
			event_type,
			user_id,
			session_id,
			platform,
			device,
			os_version,
			app_version,
			browser,
			page_path,
			page_title,
			CASE
				WHEN referrer = '' OR referrer IS NULL THEN 'Direct'
				ELSE referrer
			END AS referrer,
			utm_source,
			utm_medium,
			utm_campaign,
			properties,
			created_at
		`).
		Where("project_id = ?", projectUUID).
		Order("created_at DESC").
		Limit(int(limit)).
		Scan(&rows).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get recent events: %w", err)
	}

	result := make([]RecentEventData, len(rows))

	for i, r := range rows {
		result[i] = RecentEventData{
			ID:          r.ID,
			EventName:   r.EventName,
			EventType:   deref(r.EventType),
			UserID:      deref(r.UserID),
			SessionID:   deref(r.SessionID),
			Platform:    deref(r.Platform),
			Device:      deref(r.Device),
			OSVersion:   deref(r.OSVersion),
			AppVersion:  deref(r.AppVersion),
			Browser:     deref(r.Browser),
			PagePath:    deref(r.PagePath),
			PageTitle:   deref(r.PageTitle),
			Referrer:    r.Referrer,
			UTMSource:   deref(r.UTMSource),
			UTMMedium:   deref(r.UTMMedium),
			UTMCampaign: deref(r.UTMCampaign),
			Properties:  r.Properties,
			CreatedAt:   r.CreatedAt,
		}
	}

	return result, nil
}

func (s *svc) GetRecentEventsPaginated(ctx context.Context, projectId string, page, pageSize int32) (*PaginatedEventsResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	projectUUID := uuid.MustParse(projectId)

	var total int64
	err := s.db.WithContext(ctx).
		Table("events").
		Where("project_id = ?", projectUUID).
		Count(&total).Error
	if err != nil {
		return nil, fmt.Errorf("failed to count events: %w", err)
	}

	offset := (page - 1) * pageSize

	var rows []struct {
		ID          int64
		EventName   string
		EventType   *string
		UserID      *string
		SessionID   *string
		Platform    *string
		Device      *string
		OSVersion   *string
		AppVersion  *string
		Browser     *string
		PagePath    *string
		PageTitle   *string
		Referrer    string
		UTMSource   *string
		UTMMedium   *string
		UTMCampaign *string
		Properties  datatypes.JSON
		CreatedAt   time.Time
	}

	err = s.db.WithContext(ctx).
		Table("events").
		Select(`
			id,
			event_name,
			event_type,
			user_id,
			session_id,
			platform,
			device,
			os_version,
			app_version,
			browser,
			page_path,
			page_title,
			CASE
				WHEN referrer = '' OR referrer IS NULL THEN 'Direct'
				ELSE referrer
			END AS referrer,
			utm_source,
			utm_medium,
			utm_campaign,
			properties,
			created_at
		`).
		Where("project_id = ?", projectUUID).
		Order("created_at DESC").
		Offset(int(offset)).
		Limit(int(pageSize)).
		Scan(&rows).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get paginated events: %w", err)
	}

	events := make([]RecentEventData, len(rows))
	for i, r := range rows {
		events[i] = RecentEventData{
			ID:          r.ID,
			EventName:   r.EventName,
			EventType:   deref(r.EventType),
			UserID:      deref(r.UserID),
			SessionID:   deref(r.SessionID),
			Platform:    deref(r.Platform),
			Device:      deref(r.Device),
			OSVersion:   deref(r.OSVersion),
			AppVersion:  deref(r.AppVersion),
			Browser:     deref(r.Browser),
			PagePath:    deref(r.PagePath),
			PageTitle:   deref(r.PageTitle),
			Referrer:    r.Referrer,
			UTMSource:   deref(r.UTMSource),
			UTMMedium:   deref(r.UTMMedium),
			UTMCampaign: deref(r.UTMCampaign),
			Properties:  r.Properties,
			CreatedAt:   r.CreatedAt,
		}
	}

	totalPages := (total + int64(pageSize) - 1) / int64(pageSize)

	return &PaginatedEventsResponse{
		Events:     events,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: int32(totalPages),
	}, nil
}

type areaRow struct {
	Period  time.Time
	Desktop int64
	Mobile  int64
}

func (s *svc) GetAreaChartData(ctx context.Context, projectId string, timeRange string, eventFilter string) ([]AreaChartDataPoint, error) {
	projectUUID := uuid.MustParse(projectId)

	startTime, granularity := parseTimeRange(timeRange)

	var rows []areaRow

	query := s.db.WithContext(ctx).
		Table("events").
		Select(`
			DATE_TRUNC(?, created_at)::timestamptz AS period,
			COUNT(*) FILTER (
				WHERE
					LOWER(COALESCE(NULLIF(device, ''), '')) = 'desktop'
					OR LOWER(COALESCE(properties->>'device_type', '')) = 'desktop'
			) AS desktop,
			COUNT(*) FILTER (
				WHERE
					LOWER(COALESCE(NULLIF(device, ''), '')) IN (
						'mobile',
						'tablet',
						'iphone',
						'ipad',
						'android phone',
						'android tablet',
						'windows phone',
						'blackberry'
					)
					OR LOWER(COALESCE(properties->>'device_type', '')) IN ('mobile', 'tablet')
			) AS mobile
		`, granularity).
		Where("project_id = ?", projectUUID).
		Where("created_at >= ?", startTime)

	if eventFilter != "" {
		query = query.Where("event_name = ?", eventFilter)
	}

	err := query.
		Group("period").
		Order("period ASC").
		Scan(&rows).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get area chart data: %w", err)
	}

	result := make([]AreaChartDataPoint, len(rows))
	for i, r := range rows {
		result[i] = AreaChartDataPoint{
			Period:  r.Period.String(),
			Desktop: r.Desktop,
			Mobile:  r.Mobile,
		}
	}

	return result, nil
}

func (s *svc) GetOnlineUsers(ctx context.Context, projectId string) (int64, error) {
	projectUUID := uuid.MustParse(projectId)

	var count int64

	err := s.db.WithContext(ctx).
		Table("events").
		Select("COUNT(DISTINCT session_id)").
		Where("project_id = ?", projectUUID).
		Where("created_at >= NOW() - INTERVAL '5 minutes'").
		Scan(&count).Error

	if err != nil {
		return 0, fmt.Errorf("failed to get online users: %w", err)
	}

	return count, nil
}

func (s *svc) GetCountryData(ctx context.Context, projectId string) ([]BreakdownItem, error) {
	projectUUID := uuid.MustParse(projectId)

	var rows []struct {
		Country     string
		CountryCode string
		Emoji       string
		Count       int64
	}

	err := s.db.WithContext(ctx).
		Table("events").
		Select(`
			COALESCE(NULLIF(properties->'geo'->>'country', ''), 'Unknown') AS country,
			COALESCE(NULLIF(UPPER(properties->'geo'->>'country_code'), ''), '') AS country_code,
			COALESCE(NULLIF(MAX(properties->'geo'->>'emoji'), ''), '') AS emoji,
			COUNT(*) AS count
		`).
		Where("project_id = ?", projectUUID).
		Where("event_name = ?", "page.view").
		Group("country, country_code").
		Order("count DESC").
		Limit(50).
		Scan(&rows).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get country data: %w", err)
	}

	result := make([]BreakdownItem, len(rows))
	for i, r := range rows {
		result[i] = BreakdownItem{
			Name:        r.Country,
			Count:       r.Count,
			CountryCode: r.CountryCode,
			Emoji:       r.Emoji,
		}
	}

	return result, nil
}

func normalizeCountryKey(name string) string {
	return strings.TrimSpace(nonAlnumCountryName.ReplaceAllString(strings.ToLower(name), " "))
}

func (s *svc) GetCountryMapData(ctx context.Context, projectId string) (*CountryMapData, error) {
	countries, err := s.GetCountryData(ctx, projectId)
	if err != nil {
		return nil, err
	}

	maxCount := int64(1)
	result := make([]CountryMapEntry, len(countries))
	byCode := make(map[string]CountryMapEntry, len(countries))
	byName := make(map[string]CountryMapEntry, len(countries))

	for i, country := range countries {
		entry := CountryMapEntry{
			Name:           country.Name,
			Count:          country.Count,
			CountryCode:    strings.ToUpper(strings.TrimSpace(country.CountryCode)),
			Emoji:          country.Emoji,
			NormalizedName: normalizeCountryKey(country.Name),
		}

		if entry.Count > maxCount {
			maxCount = entry.Count
		}

		result[i] = entry
		if entry.CountryCode != "" {
			byCode[entry.CountryCode] = entry
		}
		if entry.NormalizedName != "" {
			byName[entry.NormalizedName] = entry
		}
	}

	return &CountryMapData{
		Countries: result,
		MaxCount:  maxCount,
		ByCode:    byCode,
		ByName:    byName,
	}, nil
}

func (s *svc) GetTrafficHeatmap(ctx context.Context, projectId string) (*TrafficHeatmapData, error) {
	projectUUID := uuid.MustParse(projectId)

	dayHour := make([][]int64, 7)
	monthDay := make([][]int64, 7)
	for i := 0; i < 7; i++ {
		dayHour[i] = make([]int64, 24)
		monthDay[i] = make([]int64, 12)
	}

	var dayHourRows []struct {
		Day   int
		Hour  int
		Count int64
	}

	err := s.db.WithContext(ctx).
		Table("events").
		Select(`
			EXTRACT(DOW FROM created_at)::int AS day,
			EXTRACT(HOUR FROM created_at)::int AS hour,
			COUNT(*) AS count
		`).
		Where("project_id = ?", projectUUID).
		Where("created_at >= NOW() - INTERVAL '30 days'").
		Group("day, hour").
		Order("day ASC, hour ASC").
		Scan(&dayHourRows).Error

	if err != nil {
		return nil, fmt.Errorf("failed to build day/hour heatmap: %w", err)
	}

	for _, row := range dayHourRows {
		if row.Day < 0 || row.Day > 6 || row.Hour < 0 || row.Hour > 23 {
			continue
		}
		dayHour[row.Day][row.Hour] = row.Count
	}

	var monthDayRows []struct {
		Day   int
		Month int
		Count int64
	}

	err = s.db.WithContext(ctx).
		Table("events").
		Select(`
			EXTRACT(DOW FROM created_at)::int AS day,
			EXTRACT(MONTH FROM created_at)::int AS month,
			COUNT(*) AS count
		`).
		Where("project_id = ?", projectUUID).
		Where("created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'").
		Group("day, month").
		Order("day ASC, month ASC").
		Scan(&monthDayRows).Error

	if err != nil {
		return nil, fmt.Errorf("failed to build month/day heatmap: %w", err)
	}

	for _, row := range monthDayRows {
		if row.Day < 0 || row.Day > 6 {
			continue
		}

		monthIndex := row.Month - 1
		if monthIndex < 0 || monthIndex > 11 {
			continue
		}

		monthDay[row.Day][monthIndex] = row.Count
	}

	var statRow struct {
		TodayCount    int64
		LastWeekCount int64
		LastYearCount int64
	}

	err = s.db.WithContext(ctx).
		Table("events").
		Select(`
			COUNT(*) FILTER (
				WHERE created_at >= DATE_TRUNC('day', NOW())
			) AS today_count,
			COUNT(*) FILTER (
				WHERE created_at >= NOW() - INTERVAL '7 days'
			) AS last_week_count,
			COUNT(*) FILTER (
				WHERE created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
			) AS last_year_count
		`).
		Where("project_id = ?", projectUUID).
		Scan(&statRow).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get heatmap stats: %w", err)
	}

	return &TrafficHeatmapData{
		DayHour:  dayHour,
		MonthDay: monthDay,
		Stats: TrafficHeatmapStats{
			Today:      statRow.TodayCount,
			WeeklyAvg:  statRow.LastWeekCount / 7,
			MonthlyAvg: statRow.LastYearCount / 12,
		},
	}, nil
}

func stringValue(v any) string {
	switch x := v.(type) {
	case string:
		return x
	case *string:
		if x == nil {
			return ""
		}
		return *x
	case []byte:
		return string(x)
	case bool:
		if x {
			return "true"
		}
		return ""
	default:
		return ""
	}
}

func deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func floatOrZero(f *float64) float64 {
	if f == nil {
		return 0
	}
	return *f
}
