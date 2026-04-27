package core

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"

	"github.com/mssola/useragent"
)

func StrPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func GenerateSessionToken() (string, error) {

	bytes := make([]byte, 32)

	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	return hex.EncodeToString(bytes), nil
}

func GenerateAuthStateCode(client string, secret string) (string, error) {
	nonce := make([]byte, 16)
	if _, err := rand.Read(nonce); err != nil {
		return "", err
	}

	payload := fmt.Sprintf("%s:%s", client, hex.EncodeToString(nonce))

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	sig := hex.EncodeToString(mac.Sum(nil))

	return base64.URLEncoding.EncodeToString([]byte(payload + ":" + sig)), nil
}

func ParseAuthStateCode(state, secret string) (string, error) {

	data, err := base64.URLEncoding.DecodeString(state)
	if err != nil {
		return "", err
	}

	parts := strings.Split(string(data), ":")
	if len(parts) != 3 {
		return "", errors.New("invalid state")
	}

	client := parts[0]
	nonce := parts[1]
	signature := parts[2]

	payload := client + ":" + nonce

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	expected := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(signature), []byte(expected)) {
		return "", errors.New("invalid state signature")
	}

	return client, nil
}

type DeviceInfo struct {
	Platform   string
	OS         string
	Device     string
	Browser    string
	AppVersion string
}

func ResolveDeviceInfo(props map[string]any, userAgent string) DeviceInfo {
	get := func(keys ...string) (string, bool) {
		for _, key := range keys {
			if v, ok := props[key]; ok {
				if s, ok := v.(string); ok && s != "" && s != "Unknown" {
					return s, true
				}
			}
		}
		return "", false
	}

	info := DeviceInfo{}

	info.Platform, _ = get("platform")
	info.Device, _ = get("device", "device_type")
	info.OS, _ = get("os", "os_version")
	info.Browser, _ = get("browser")
	info.AppVersion, _ = get("app_version")

	if info.Platform == "" || info.Device == "" || info.OS == "" || info.Browser == "" {
		ua := useragent.New(userAgent)

		if info.Platform == "" {
			platform := ua.Platform()
			if platform == "" || platform == "unknown" {
				platform = "Unknown"
			}
			info.Platform = platform
		}

		if info.OS == "" {
			os := ua.OS()
			if os == "" || os == "unknown" {
				os = "Unknown"
			}
			info.OS = os
		}

		if info.Browser == "" {
			name, version := ua.Browser()
			if name == "" || name == "unknown" {
				info.Browser = "Unknown Browser"
			} else {
				if version == "" {
					info.Browser = name
				} else {
					info.Browser = name + " " + version
				}
			}
		}

		if info.Device == "" {
			switch {
			case ua.Mobile():
				info.Device = "mobile"
			default:
				info.Device = "desktop"
			}
		}
	}

	if info.Platform == "" {
		info.Platform = "Unknown"
	}
	if info.Device == "" {
		info.Device = "Unknown"
	}
	if info.OS == "" {
		info.OS = "Unknown"
	}
	if info.Browser == "" {
		info.Browser = "Unknown Browser"
	}
	if info.AppVersion == "" {
		info.AppVersion = "Unknown"
	}

	return info
}

func IsEmpty(s string) bool {
	return strings.TrimSpace(s) == ""
}

func IsNilOrEmpty(s *string) bool {
	return s == nil || strings.TrimSpace(*s) == ""
}

func Normalize(s string) string {
	return strings.TrimSpace(strings.ToLower(s))
}

func FirstEmpty(pairs ...string) (string, bool) {
	for i := 0; i < len(pairs); i += 2 {
		name := pairs[i]
		val := pairs[i+1]

		if strings.TrimSpace(val) == "" {
			return name, true
		}
	}
	return "", false
}

func Require(pairs ...string) error {
	if field, ok := FirstEmpty(pairs...); ok {
		return fmt.Errorf("%s is required", field)
	}
	return nil
}
