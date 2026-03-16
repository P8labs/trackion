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
