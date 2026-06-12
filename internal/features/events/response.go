package events

import (
	"encoding/json"
	"trackion/internal/core"
	"trackion/internal/core/geoip"
	db "trackion/internal/db/models"

	"github.com/google/uuid"
)

func ToInsertEvents(projectID uuid.UUID, events []EventParams, geo *geoip.Location) ([]db.Event, error) {
	out := make([]db.Event, 0, len(events))

	for _, e := range events {
		p, err := ToInsertEvent(projectID, e, geo)
		if err != nil {
			return nil, err
		}
		out = append(out, p)
	}

	return out, nil
}

func ToInsertEvent(projectID uuid.UUID, e EventParams, geo *geoip.Location) (db.Event, error) {
	deviceInfo := resolveEventDeviceInfo(e)
	cleanedProps := make(map[string]any)
	for k, v := range e.Properties {
		switch k {
		case "device", "platform", "browser", "user_agent", "device_type":
			continue
		default:
			cleanedProps[k] = v
		}
	}

	props, err := json.Marshal(mergeGeoProperties(cleanedProps, geo))

	if err != nil {
		return db.Event{}, err
	}
	return db.Event{
		ProjectID:   projectID,
		EventName:   e.Event,
		EventType:   e.Type,
		SessionID:   core.StrPtr(e.SessionID),
		PagePath:    core.StrPtr(e.Page.Path),
		PageTitle:   core.StrPtr(e.Page.Title),
		Referrer:    core.StrPtr(e.Page.Referrer),
		UTMSource:   core.StrPtr(e.Utm.Source),
		UTMMedium:   core.StrPtr(e.Utm.Medium),
		UTMCampaign: core.StrPtr(e.Utm.Campaign),
		Properties:  props,
		Platform:    &deviceInfo.Platform,
		Device:      &deviceInfo.Device,
		OSVersion:   &deviceInfo.OS,
		AppVersion:  &deviceInfo.AppVersion,
		Browser:     &deviceInfo.Browser,
	}, nil
}

func resolveEventDeviceInfo(e EventParams) core.DeviceInfo {
	info := core.ResolveDeviceInfo(e.Properties, e.UserAgent)

	if e.Platform != nil && *e.Platform != "" && *e.Platform != "Unknown" {
		info.Platform = *e.Platform
	}
	if e.Device != nil && *e.Device != "" && *e.Device != "Unknown" {
		info.Device = *e.Device
	}
	if e.Browser != nil && *e.Browser != "" && *e.Browser != "Unknown" {
		info.Browser = *e.Browser
	}

	return info
}

func mergeGeoProperties(properties map[string]any, geo *geoip.Location) map[string]any {
	if properties == nil {
		properties = map[string]any{}
	}

	if geo == nil {
		return properties
	}

	properties["geo"] = map[string]any{
		"country":      geo.Country,
		"country_code": geo.CountryCode,
		"emoji":        geo.Emoji,
		"region":       geo.Region,
		"city":         geo.City,
		"latitude":     geo.Latitude,
		"longitude":    geo.Longitude,
	}

	return properties
}

func applyDefaults(cfg *ProjectConfig) {

	if !cfg.AutoPageview {
		cfg.AutoPageview = true
	}
	if !cfg.TrackTimeSpent {
		cfg.TrackTimeSpent = true
	}
	if !cfg.TrackCampaign {
		cfg.TrackCampaign = true
	}
}
