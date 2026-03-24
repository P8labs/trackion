package dashboard

import "testing"

func TestClassifyReferrer(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want string
	}{
		{name: "direct empty", in: "", want: "Direct"},
		{name: "google", in: "https://www.google.com/search?q=trackion", want: "Google"},
		{name: "x short domain", in: "https://t.co/abc", want: "X (Twitter)"},
		{name: "x domain", in: "https://x.com/p8labs", want: "X (Twitter)"},
		{name: "twitter domain", in: "https://twitter.com/p8labs", want: "X (Twitter)"},
		{name: "github", in: "https://github.com/P8labs/trackion", want: "GitHub"},
		{name: "unknown host fallback", in: "https://news.ycombinator.com/item?id=1", want: "news.ycombinator.com"},
		{name: "host without scheme", in: "reddit.com/r/golang", want: "Reddit"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := classifyReferrer(tc.in)
			if got != tc.want {
				t.Fatalf("classifyReferrer(%q) = %q, want %q", tc.in, got, tc.want)
			}
		})
	}
}

func TestNormalizeReferrerHost(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want string
	}{
		{name: "https host", in: "https://www.google.com/search?q=x", want: "google.com"},
		{name: "no scheme", in: "docs.github.com/en/actions", want: "docs.github.com"},
		{name: "invalid", in: "::not-a-url::", want: ""},
		{name: "empty", in: "", want: ""},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := normalizeReferrerHost(tc.in)
			if got != tc.want {
				t.Fatalf("normalizeReferrerHost(%q) = %q, want %q", tc.in, got, tc.want)
			}
		})
	}
}
