package dashboard

import (
	"context"
	"fmt"
	"net/url"
	"sort"
	"strings"
	"time"
	"trackion/internal/repository"

	"github.com/google/uuid"
)

type DashboardData struct {
	TotalEvents    int64                `json:"total_events"`
	PageViews      int64                `json:"page_views"`
	CustomEvents   int64                `json:"custom_events"`
	AvgTimeSpent   string               `json:"avg_time_spent"`
	EventsOverTime []TimeSeriesData     `json:"events_over_time"`
	EventBreakdown []EventBreakdownItem `json:"event_breakdown"`
	RecentEvents   []repository.Event   `json:"recent_events"`
}

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
	SessionID   string      `json:"session_id"`
	PagePath    string      `json:"page_path,omitempty"`
	Referrer    string      `json:"referrer,omitempty"`
	UTMSource   string      `json:"utm_source,omitempty"`
	UTMMedium   string      `json:"utm_medium,omitempty"`
	UTMCampaign string      `json:"utm_campaign,omitempty"`
	Properties  interface{} `json:"properties,omitempty"`
	CreatedAt   time.Time   `json:"created_at"`
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

type Service interface {
	GetProjectEvents(ctx context.Context, projectId string, limit int32) ([]repository.Event, error)

	GetChartData(ctx context.Context, projectId string, timeRange string, eventFilter string) ([]ChartDataPoint, error)
	GetBreakdownData(ctx context.Context, projectId string) (*BreakdownData, error)
	GetRecentEventsData(ctx context.Context, projectId string, limit int32) ([]RecentEventData, error)

	// New optimized endpoints
	GetDashboardCounts(ctx context.Context, projectId string) (*DashboardCounts, error)
	GetChartDataFlexible(ctx context.Context, projectId string, request ChartDataRequest) ([]ChartDataPoint, error)
	GetAreaChartData(ctx context.Context, projectId string, timeRange string, eventFilter string) ([]AreaChartDataPoint, error)
	GetDeviceAnalytics(ctx context.Context, projectId string) (*DeviceAnalyticsData, error)
	GetTrafficSources(ctx context.Context, projectId string) (*TrafficSourcesData, error)
	GetTopPages(ctx context.Context, projectId string) ([]TopPage, error)
	GetRecentEventsFormatted(ctx context.Context, projectId string, limit int32) ([]RecentEventData, error)
	GetOnlineUsers(ctx context.Context, projectId string) (int64, error)
	GetCountryData(ctx context.Context, projectId string) ([]BreakdownItem, error)
}

type svc struct {
	repo repository.Querier
}

func NewService(repo repository.Querier) Service {
	return &svc{repo: repo}
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

func (s *svc) GetProjectEvents(ctx context.Context, projectId string, limit int32) ([]repository.Event, error) {
	projectUUID := uuid.MustParse(projectId)

	events, err := s.repo.GetRecentEvents(ctx, repository.GetRecentEventsParams{
		ProjectID: projectUUID,
		Limit:     limit,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get events: %w", err)
	}

	return events, nil
}

func (s *svc) GetChartData(ctx context.Context, projectId string, timeRange string, eventFilter string) ([]ChartDataPoint, error) {
	projectUUID := uuid.MustParse(projectId)

	// Parse time range and determine appropriate granularity
	startTime, granularity := parseTimeRange(timeRange)

	params := repository.GetEventsOverTimeFilteredParams{
		ProjectID: projectUUID,
		CreatedAt: startTime,
		DateTrunc: granularity,
		Column4:   eventFilter,
	}

	data, err := s.repo.GetEventsOverTimeFiltered(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to get chart data: %w", err)
	}

	result := make([]ChartDataPoint, len(data))
	for i, point := range data {
		result[i] = ChartDataPoint{
			Period: formatPeriod(point.Period, granularity),
			Count:  point.Count,
		}
	}

	return result, nil
}

func (s *svc) GetBreakdownData(ctx context.Context, projectId string) (*BreakdownData, error) {
	projectUUID := uuid.MustParse(projectId)

	// Get device breakdown
	deviceData, err := s.repo.GetDeviceBreakdown(ctx, projectUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get device breakdown: %w", err)
	}

	devices := []BreakdownItem{}
	browsers := []BreakdownItem{}
	colorIndex := 0

	for _, item := range deviceData {
		breakdownItem := BreakdownItem{
			Name:  item.Name,
			Count: item.Count,
			Color: deviceColors[colorIndex%len(deviceColors)],
		}

		if item.Category == "device" {
			devices = append(devices, breakdownItem)
		} else {
			browsers = append(browsers, breakdownItem)
		}
		colorIndex++
	}

	// Get referrer breakdown
	referrerData, err := s.repo.GetReferrerBreakdown(ctx, projectUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get referrer breakdown: %w", err)
	}

	referrers := make([]BreakdownItem, len(referrerData))
	for i, ref := range referrerData {
		referrers[i] = BreakdownItem{
			Name:  ref.Name,
			Count: ref.Count,
			Color: deviceColors[i%len(deviceColors)],
		}
	}

	// Get UTM breakdown
	utmData, err := s.repo.GetUTMBreakdown(ctx, projectUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get UTM breakdown: %w", err)
	}

	utmBreakdown := make([]UTMBreakdown, len(utmData))
	for i, utm := range utmData {
		utmBreakdown[i] = UTMBreakdown{
			Source:   utm.UtmSource,
			Medium:   utm.UtmMedium,
			Campaign: utm.UtmCampaign,
			Count:    utm.Count,
		}
	}

	// Get top pages
	pageData, err := s.repo.GetTopPagesBreakdown(ctx, projectUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get top pages breakdown: %w", err)
	}

	topPages := make([]PageBreakdown, len(pageData))
	for i, page := range pageData {
		topPages[i] = PageBreakdown{
			Path:        *page.Name,
			Count:       page.Count,
			UniqueViews: page.UniqueViews,
		}
	}

	return &BreakdownData{
		Devices:   devices,
		Browsers:  browsers,
		Referrers: referrers,
		UTM:       utmBreakdown,
		TopPages:  topPages,
	}, nil
}

func (s *svc) GetRecentEventsData(ctx context.Context, projectId string, limit int32) ([]RecentEventData, error) {
	projectUUID := uuid.MustParse(projectId)

	events, err := s.repo.GetRecentEventsLimited(ctx, repository.GetRecentEventsLimitedParams{
		ProjectID: projectUUID,
		Limit:     limit,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get recent events: %w", err)
	}

	result := make([]RecentEventData, len(events))
	for i, event := range events {
		var sessionID, pagePath, referrer, utmSource, utmMedium, utmCampaign string
		if event.SessionID != nil {
			sessionID = *event.SessionID
		}
		if event.PagePath != nil {
			pagePath = *event.PagePath
		}
		if event.Referrer != nil {
			referrer = *event.Referrer
		}
		if event.UtmSource != nil {
			utmSource = *event.UtmSource
		}
		if event.UtmMedium != nil {
			utmMedium = *event.UtmMedium
		}
		if event.UtmCampaign != nil {
			utmCampaign = *event.UtmCampaign
		}

		result[i] = RecentEventData{
			ID:          event.ID,
			EventName:   event.EventName,
			SessionID:   sessionID,
			PagePath:    pagePath,
			Referrer:    referrer,
			UTMSource:   utmSource,
			UTMMedium:   utmMedium,
			UTMCampaign: utmCampaign,
			Properties:  event.Properties,
			CreatedAt:   event.CreatedAt,
		}
	}

	return result, nil
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

	counts, err := s.repo.GetDashboardCounts(ctx, projectUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get dashboard counts: %w", err)
	}

	avgTimeSpentSeconds := 0.0

	if counts.TimeSpentSessions > 0 {
		avgTimeSpentSeconds = float64(counts.TotalTimeMs) /
			float64(counts.TimeSpentSessions) /
			1000.0
	}

	return &DashboardCounts{
		TotalEvents:         counts.TotalEvents,
		Views:               counts.PageViews,
		UniqueViews:         counts.UniqueViews,
		AvgTimeSpentSeconds: avgTimeSpentSeconds,
	}, nil
}

func (s *svc) GetChartDataFlexible(ctx context.Context, projectId string, request ChartDataRequest) ([]ChartDataPoint, error) {
	projectUUID := uuid.MustParse(projectId)

	var startTime time.Time
	var granularity string

	if request.TimeRange == "custom" && request.StartTime != nil {
		startTime = *request.StartTime
		if request.EndTime != nil {
			duration := request.EndTime.Sub(startTime)
			if duration <= 2*time.Hour {
				granularity = "minute"
			} else if duration <= 48*time.Hour {
				granularity = "hour"
			} else {
				granularity = "day"
			}
		} else {
			granularity = "hour"
		}
	} else {
		startTime, granularity = parseTimeRange(request.TimeRange)
	}

	params := repository.GetChartDataFlexibleParams{
		ProjectID: projectUUID,
		CreatedAt: startTime,
		DateTrunc: granularity,
		Column4:   request.EventFilter,
	}

	data, err := s.repo.GetChartDataFlexible(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to get chart data: %w", err)
	}

	result := make([]ChartDataPoint, len(data))
	for i, point := range data {
		result[i] = ChartDataPoint{
			Period: formatPeriod(point.Period, granularity),
			Count:  point.Count,
		}
	}

	return result, nil
}

func (s *svc) GetDeviceAnalytics(ctx context.Context, projectId string) (*DeviceAnalyticsData, error) {
	projectUUID := uuid.MustParse(projectId)

	data, err := s.repo.GetDeviceAnalytics(ctx, projectUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get device analytics: %w", err)
	}

	devices := []BreakdownItem{}
	browsers := []BreakdownItem{}
	colorIndex := 0

	for _, item := range data {
		breakdownItem := BreakdownItem{
			Name:  item.DeviceName,
			Count: item.Count,
			Color: deviceColors[colorIndex%len(deviceColors)],
		}

		if item.Category == "device" {
			devices = append(devices, breakdownItem)
		} else {
			browsers = append(browsers, breakdownItem)
		}
		colorIndex++
	}

	return &DeviceAnalyticsData{
		Devices:  devices,
		Browsers: browsers,
	}, nil
}

func (s *svc) GetTrafficSources(ctx context.Context, projectId string) (*TrafficSourcesData, error) {
	projectUUID := uuid.MustParse(projectId)

	data, err := s.repo.GetTrafficSources(ctx, projectUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get traffic sources: %w", err)
	}

	referrerCounts := map[string]int64{}
	countryCounts := map[string]int64{}
	utmSourceCounts := map[string]int64{}
	utmMediumCounts := map[string]int64{}

	for _, item := range data {
		source := classifyReferrer(item.Referrer)
		referrerCounts[source]++

		country := strings.TrimSpace(item.Country)
		if country == "" {
			country = "Unknown"
		}
		countryCounts[country]++

		utmSource := strings.TrimSpace(item.UtmSource)
		if utmSource == "" {
			utmSource = "None"
		}
		utmSourceCounts[utmSource]++

		utmMedium := strings.TrimSpace(item.UtmMedium)
		if utmMedium == "" {
			utmMedium = "None"
		}
		utmMediumCounts[utmMedium]++
	}

	referrers := toBreakdownItems(referrerCounts)
	countries := toBreakdownItems(countryCounts)
	utmSources := toBreakdownItems(utmSourceCounts)
	utmMediums := toBreakdownItems(utmMediumCounts)

	return &TrafficSourcesData{
		Referrers:  referrers,
		Countries:  countries,
		UTMSources: utmSources,
		UTMMediums: utmMediums,
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

func (s *svc) GetTopPages(ctx context.Context, projectId string) ([]TopPage, error) {
	projectUUID := uuid.MustParse(projectId)

	pages, err := s.repo.GetTopPages(ctx, projectUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get top pages: %w", err)
	}

	result := make([]TopPage, len(pages))
	for i, page := range pages {
		var avgTimeSeconds float64
		if pages[i].AvgTimeSeconds.Valid {
			if val, err := pages[i].AvgTimeSeconds.Float64Value(); err == nil {
				avgTimeSeconds = val.Float64
			}
		}

		path := ""
		if page.Path != nil {
			path = *page.Path
		}

		result[i] = TopPage{
			Path:           path,
			TotalViews:     page.TotalViews,
			UniqueVisitors: page.UniqueVisitors,
			AvgTimeSeconds: avgTimeSeconds,
		}
	}

	return result, nil
}

func (s *svc) GetRecentEventsFormatted(ctx context.Context, projectId string, limit int32) ([]RecentEventData, error) {
	projectUUID := uuid.MustParse(projectId)

	events, err := s.repo.GetRecentEventsFormatted(ctx, repository.GetRecentEventsFormattedParams{
		ProjectID: projectUUID,
		Limit:     limit,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get recent events: %w", err)
	}

	result := make([]RecentEventData, len(events))
	for i, event := range events {
		var sessionID, pagePath, referrer string
		if event.SessionID != nil {
			sessionID = *event.SessionID
		}
		if event.PagePath != nil {
			pagePath = *event.PagePath
		}
		if event.ReferrerSource != nil {
			if str, ok := event.ReferrerSource.(string); ok {
				referrer = str
			}
		}

		result[i] = RecentEventData{
			ID:         event.ID,
			EventName:  event.EventName,
			SessionID:  sessionID,
			PagePath:   pagePath,
			Referrer:   referrer,
			Properties: event.Properties,
			CreatedAt:  event.CreatedAt,
		}
	}

	return result, nil
}

func (s *svc) GetAreaChartData(ctx context.Context, projectId string, timeRange string, eventFilter string) ([]AreaChartDataPoint, error) {
	projectUUID := uuid.MustParse(projectId)

	startTime, granularity := parseTimeRange(timeRange)

	params := repository.GetAreaChartDataByDeviceParams{
		ProjectID: projectUUID,
		CreatedAt: startTime,
		DateTrunc: granularity,
		Column4:   eventFilter,
	}

	data, err := s.repo.GetAreaChartDataByDevice(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to get area chart data: %w", err)
	}

	result := make([]AreaChartDataPoint, len(data))
	for i, point := range data {
		result[i] = AreaChartDataPoint{
			Period:  point.Period.String(),
			Desktop: point.Desktop,
			Mobile:  point.Mobile,
		}
	}

	return result, nil
}

func (s *svc) GetOnlineUsers(ctx context.Context, projectId string) (int64, error) {
	projectUUID := uuid.MustParse(projectId)

	count, err := s.repo.GetOnlineUsers(ctx, projectUUID)
	if err != nil {
		return 0, fmt.Errorf("failed to get online users: %w", err)
	}

	return count, nil
}

func (s *svc) GetCountryData(ctx context.Context, projectId string) ([]BreakdownItem, error) {
	projectUUID := uuid.MustParse(projectId)

	data, err := s.repo.GetCountryData(ctx, projectUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get country data: %w", err)
	}

	result := make([]BreakdownItem, len(data))
	for i, country := range data {
		countryName := stringValue(country.Country)
		if countryName == "" {
			countryName = "Unknown"
		}
		countryCode := stringValue(any(country.CountryCode))
		emoji := stringValue(country.Emoji)

		result[i] = BreakdownItem{
			Name:        countryName,
			Count:       country.Count,
			CountryCode: countryCode,
			Emoji:       emoji,
		}
	}

	return result, nil
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
