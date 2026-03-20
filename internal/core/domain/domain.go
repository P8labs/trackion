package domain

import (
	"errors"
	"fmt"
	"net"
	"net/netip"
	"net/url"
	"strconv"
	"strings"
)

const maxDomainEntries = 50

var (
	ErrInvalidDomain = errors.New("invalid domain")
)

func NormalizeDomains(input []string) ([]string, error) {
	if len(input) > maxDomainEntries {
		return nil, fmt.Errorf("too many domains; max allowed is %d", maxDomainEntries)
	}

	seen := make(map[string]struct{}, len(input))
	out := make([]string, 0, len(input))

	for _, raw := range input {
		if strings.TrimSpace(raw) == "" {
			continue
		}

		norm, err := NormalizeDomain(raw)
		if err != nil {
			return nil, err
		}
		if _, ok := seen[norm]; ok {
			continue
		}
		seen[norm] = struct{}{}
		out = append(out, norm)
	}

	return out, nil
}

func NormalizeDomain(raw string) (string, error) {
	s := strings.TrimSpace(strings.ToLower(raw))
	if s == "" {
		return "", ErrInvalidDomain
	}

	if !strings.Contains(s, "://") {
		s = "http://" + s
	}

	u, err := url.Parse(s)
	if err != nil {
		return "", fmt.Errorf("%w: %s", ErrInvalidDomain, raw)
	}

	host := strings.TrimSpace(strings.ToLower(u.Host))
	if host == "" {
		return "", fmt.Errorf("%w: %s", ErrInvalidDomain, raw)
	}

	host = strings.TrimSuffix(host, ".")
	hostName := host
	port := ""
	if strings.Contains(host, ":") {
		h, p, splitErr := net.SplitHostPort(host)
		if splitErr == nil {
			hostName = h
			port = p
		} else {
			// If host contains ':' but is not host:port, it may be an IPv6 without brackets.
			if addrErr := validateHost(host); addrErr == nil {
				hostName = host
				port = ""
			} else {
				return "", fmt.Errorf("%w: %s", ErrInvalidDomain, raw)
			}
		}
	}

	if err := validateHost(hostName); err != nil {
		return "", fmt.Errorf("%w: %s", ErrInvalidDomain, raw)
	}

	if port != "" {
		v, pErr := strconv.Atoi(port)
		if pErr != nil || v < 1 || v > 65535 {
			return "", fmt.Errorf("%w: %s", ErrInvalidDomain, raw)
		}
	}

	if port == "" {
		return hostName, nil
	}
	return hostName + ":" + port, nil
}

func IsAllowed(allowedDomains []string, requestDomain string) bool {
	requestNorm, err := NormalizeDomain(requestDomain)
	if err != nil {
		return false
	}

	reqHost, reqPort := splitHostPort(requestNorm)

	for _, allowed := range allowedDomains {
		allowNorm, aErr := NormalizeDomain(allowed)
		if aErr != nil {
			continue
		}
		allowHost, allowPort := splitHostPort(allowNorm)

		if allowPort != "" {
			if requestNorm == allowNorm {
				return true
			}
			continue
		}

		if reqPort != "" {
			if reqHost == allowHost || strings.HasSuffix(reqHost, "."+allowHost) {
				return true
			}
			continue
		}

		if requestNorm == allowNorm || strings.HasSuffix(requestNorm, "."+allowNorm) {
			return true
		}
	}

	return false
}

func splitHostPort(domain string) (string, string) {
	host := domain
	port := ""
	if strings.Contains(domain, ":") {
		h, p, err := net.SplitHostPort(domain)
		if err == nil {
			host = h
			port = p
		}
	}
	return host, port
}

func validateHost(host string) error {
	if host == "localhost" {
		return nil
	}

	if _, err := netip.ParseAddr(host); err == nil {
		return nil
	}

	parts := strings.Split(host, ".")
	if len(parts) < 2 {
		return ErrInvalidDomain
	}

	for _, p := range parts {
		if p == "" {
			return ErrInvalidDomain
		}
		if strings.HasPrefix(p, "-") || strings.HasSuffix(p, "-") {
			return ErrInvalidDomain
		}
		for _, ch := range p {
			if (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '-' {
				continue
			}
			return ErrInvalidDomain
		}
	}

	return nil
}
