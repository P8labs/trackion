package dashboard

import "time"

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

type RealtimeEventData struct {
	ID        int64     `json:"id"`
	EventName string    `json:"event_name"`
	EventType string    `json:"event_type,omitempty"`
	UserID    string    `json:"user_id,omitempty"`
	SessionID string    `json:"session_id"`
	Platform  string    `json:"platform,omitempty"`
	Device    string    `json:"device,omitempty"`
	PagePath  string    `json:"page_path,omitempty"`
	CreatedAt time.Time `json:"created_at"`
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
