package errortracking

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"strings"
	"time"
)

// ErrorMetadata represents the error-specific data stored in event properties
type ErrorMetadata struct {
	ErrorMessage string                 `json:"error_message"`
	StackTrace   string                 `json:"stack_trace"`
	Fingerprint  string                 `json:"fingerprint"`
	URL          string                 `json:"url"`
	LineNumber   *int                   `json:"line_number,omitempty"`
	ColumnNumber *int                   `json:"column_number,omitempty"`
	UserAgent    string                 `json:"user_agent,omitempty"`
	Context      map[string]interface{} `json:"context,omitempty"`
	// Device information from properties
	Browser      string                 `json:"browser,omitempty"`
	Platform     string                 `json:"platform,omitempty"`
	Device       string                 `json:"device,omitempty"`
	OS           string                 `json:"os,omitempty"`
}

// GroupedError represents an aggregated error group
type GroupedError struct {
	Fingerprint string    `json:"fingerprint"`
	Message     string    `json:"message"`
	Count       int64     `json:"count"`
	FirstSeen   time.Time `json:"first_seen"`
	LastSeen    time.Time `json:"last_seen"`
	LastURL     string    `json:"last_url,omitempty"`
}

// ErrorOccurrence represents a single error instance
type ErrorOccurrence struct {
	ID           int64                  `json:"id"`
	Timestamp    time.Time              `json:"timestamp"`
	Message      string                 `json:"message"`
	StackTrace   string                 `json:"stack_trace"`
	URL          string                 `json:"url"`
	UserID       *string                `json:"user_id,omitempty"`
	SessionID    *string                `json:"session_id,omitempty"`
	Browser      *string                `json:"browser,omitempty"`
	Platform     *string                `json:"platform,omitempty"`
	LineNumber   *int                   `json:"line_number,omitempty"`
	ColumnNumber *int                   `json:"column_number,omitempty"`
	Context      map[string]interface{} `json:"context,omitempty"`
}

// ErrorListRequest represents query parameters for listing errors
type ErrorListRequest struct {
	ProjectID string
	TimeRange string // "24h", "7d", "30d", "all"
	Limit     int
	Offset    int
}

// ErrorDetailRequest represents query parameters for error details
type ErrorDetailRequest struct {
	ProjectID   string
	Fingerprint string
	Limit       int
	Offset      int
}

// GenerateFingerprint creates a deterministic hash for error grouping
// Using SHA256(message + first_line_of_stack)
func GenerateFingerprint(message string, stackTrace string) string {
	// Normalize message
	normalizedMessage := strings.TrimSpace(message)

	// Extract first line of stack trace
	firstLine := ""
	if stackTrace != "" {
		lines := strings.SplitSeq(stackTrace, "\n")
		for line := range lines {
			trimmed := strings.TrimSpace(line)
			// Skip empty lines and the error message line
			if trimmed != "" && trimmed != normalizedMessage {
				firstLine = trimmed
				break
			}
		}
	}

	// Create hash
	input := normalizedMessage + firstLine
	hash := sha256.Sum256([]byte(input))
	return hex.EncodeToString(hash[:])
}

// ParseErrorMetadata extracts error metadata from event properties JSONB
func ParseErrorMetadata(propertiesJSON []byte) (*ErrorMetadata, error) {
	var metadata ErrorMetadata
	if err := json.Unmarshal(propertiesJSON, &metadata); err != nil {
		return nil, err
	}
	return &metadata, nil
}
