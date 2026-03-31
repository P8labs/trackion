package runtime

import (
	"testing"
	"trackion/internal/db"
)

func TestEvaluateFlag(t *testing.T) {
	tests := []struct {
		name string
		flag db.Flag
		uid  string
		want bool
	}{
		{
			name: "disabled always false",
			flag: db.Flag{Key: "checkout_v2", Enabled: false, RolloutPercentage: 100},
			uid:  "user-1",
			want: false,
		},
		{
			name: "enabled zero rollout false",
			flag: db.Flag{Key: "checkout_v2", Enabled: true, RolloutPercentage: 0},
			uid:  "user-1",
			want: false,
		},
		{
			name: "enabled full rollout true without user",
			flag: db.Flag{Key: "checkout_v2", Enabled: true, RolloutPercentage: 100},
			uid:  "",
			want: true,
		},
		{
			name: "enabled partial rollout missing user false",
			flag: db.Flag{Key: "checkout_v2", Enabled: true, RolloutPercentage: 25},
			uid:  "",
			want: false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := evaluateFlag(tc.flag, tc.uid)
			if got != tc.want {
				t.Fatalf("evaluateFlag() = %v, want %v", got, tc.want)
			}
		})
	}
}

func TestEvaluateFlag_IsDeterministicForSameUser(t *testing.T) {
	flag := db.Flag{Key: "pricing_banner", Enabled: true, RolloutPercentage: 33}
	uid := "user-42"

	first := evaluateFlag(flag, uid)
	for i := 0; i < 20; i++ {
		if got := evaluateFlag(flag, uid); got != first {
			t.Fatalf("non-deterministic result at iteration %d: got %v, want %v", i, got, first)
		}
	}
}
