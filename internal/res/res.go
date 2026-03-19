package res

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

func Write(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func Read(r *http.Request, data any) error {
	if r.Body == nil {
		return errors.New("empty request body")
	}

	r.Body = http.MaxBytesReader(nil, r.Body, 1<<20) // 1MB limit

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(data); err != nil {
		return fmt.Errorf("invalid JSON: %w", err)
	}

	if decoder.More() {
		return errors.New("invalid JSON: multiple objects")
	}

	return nil
}

func Parse[T any](r *http.Request) (T, error) {
	var body T

	if r.Header.Get("Content-Type") != "application/json" {
		return body, errors.New("Content-Type must be application/json")
	}
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err := decoder.Decode(&body)
	if err != nil {
		if errors.Is(err, io.EOF) {
			return body, errors.New("request body is empty")
		}

		msg := err.Error()

		switch {
		case strings.Contains(msg, "Time.UnmarshalJSON"):
			return body, errors.New("invalid timestamp format: expected ISO string (e.g. 2026-03-19T08:50:37Z)")

		case strings.Contains(msg, "cannot unmarshal"):
			return body, errors.New("invalid request payload structure")

		case strings.Contains(msg, "unknown field"):
			return body, fmt.Errorf("request contains unknown fields: %s", err.Error())

		default:
			return body, errors.New("invalid JSON payload")
		}
	}

	if err := validate.Struct(body); err != nil {
		if ve, ok := err.(validator.ValidationErrors); ok {
			return body, formatValidationErrors(ve)
		}
		return body, err
	}

	return body, nil
}

type Rs[T any] struct {
	Message string `json:"message"`
	Status  bool   `json:"status"`
	Data    T      `json:"data"`
}

type M map[string]any

func Error(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	data := Rs[any]{
		Message: message,
		Status:  false,
	}
	json.NewEncoder(w).Encode(data)
}

func Success[T any](w http.ResponseWriter, payload T, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	data := Rs[T]{
		Data:    payload,
		Message: message,
		Status:  true,
	}
	json.NewEncoder(w).Encode(data)
}
func SuccessRaw(w http.ResponseWriter, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(payload)
}

func formatValidationErrors(ve validator.ValidationErrors) error {
	var msgs []string

	for _, e := range ve {
		switch e.Tag() {
		case "required":
			msgs = append(msgs, fmt.Sprintf("%s is required", e.Field()))
		case "min":
			msgs = append(msgs, fmt.Sprintf("%s must be at least %s characters", e.Field(), e.Param()))
		case "max":
			msgs = append(msgs, fmt.Sprintf("%s must be at most %s characters", e.Field(), e.Param()))
		default:
			msgs = append(msgs, fmt.Sprintf("%s is invalid", e.Field()))
		}
	}

	return errors.New(strings.Join(msgs, ", "))
}
