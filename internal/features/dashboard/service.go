package dashboard

import (
	"context"
	"fmt"
	"log"
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

type Service interface {
	GetDashboardData(ctx context.Context, projectId string) (*DashboardData, error)
	GetProjectEvents(ctx context.Context, projectId string, limit int32) ([]repository.Event, error)
}

type svc struct {
	repo repository.Querier
}

func NewService(repo repository.Querier) Service {
	return &svc{repo: repo}
}

var colorMap = map[string]string{
	"pageview":   "#14b8a6",
	"time_spent": "#f59e0b",
	"click":      "#ef4444",
	"custom":     "#8b5cf6",
}

func (s *svc) GetDashboardData(ctx context.Context, projectId string) (*DashboardData, error) {
	projectUUID := uuid.MustParse(projectId)

	totalCount, err := s.repo.GetTotalEventCount(ctx, projectUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get total event count: %w", err)
	}

	pageViewCount, err := s.repo.GetPageViewCount(ctx, projectUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get page view count: %w", err)
	}

	customEventCount, err := s.repo.GetCustomEventCount(ctx, projectUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get custom event count: %w", err)
	}

	timeSpentInterface, err := s.repo.GetTimeSpentHours(ctx, projectUUID)
	var timeSpentHours int64 = 0
	if err == nil && timeSpentInterface != nil {
		switch v := timeSpentInterface.(type) {
		case int64:
			timeSpentHours = v
		case int32:
			timeSpentHours = int64(v)
		case int:
			timeSpentHours = int64(v)
		}
	}
	avgTimeSpent := formatTimeSpent(timeSpentHours)

	eventsOverTime, err := s.repo.GetEventsOverTime(ctx, projectUUID)
	if err != nil {
		eventsOverTime = []repository.GetEventsOverTimeRow{}
	}

	timeSeriesData := make([]TimeSeriesData, len(eventsOverTime))
	for i, evt := range eventsOverTime {
		timeSeriesData[i] = TimeSeriesData{
			Date:   evt.Date.Time.Format("2006-01-02"),
			Events: evt.Count,
		}
	}

	eventCounts, err := s.repo.GetEventCountByName(ctx, projectUUID)
	if err != nil {
		eventCounts = []repository.GetEventCountByNameRow{}
	}

	eventBreakdown := make([]EventBreakdownItem, 0)
	for _, ec := range eventCounts {
		color := colorMap[ec.EventName]
		if color == "" {
			color = colorMap["custom"]
		}
		eventBreakdown = append(eventBreakdown, EventBreakdownItem{
			Name:  ec.EventName,
			Count: ec.Count,
			Color: color,
		})
	}

	recentEvents, err := s.repo.GetRecentEvents(ctx, repository.GetRecentEventsParams{
		ProjectID: projectUUID,
		Limit:     50,
	})
	if err != nil {
		log.Printf("RECENT EVENT FETCH ERROR: %s", err.Error())
		recentEvents = []repository.Event{}
	}

	return &DashboardData{
		TotalEvents:    totalCount,
		PageViews:      pageViewCount,
		CustomEvents:   customEventCount,
		AvgTimeSpent:   avgTimeSpent,
		EventsOverTime: timeSeriesData,
		EventBreakdown: eventBreakdown,
		RecentEvents:   recentEvents,
	}, nil
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
