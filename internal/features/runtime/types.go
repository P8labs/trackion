package runtime

import "encoding/json"

type FlagDTO struct {
	Key               string `json:"key"`
	Enabled           bool   `json:"enabled"`
	RolloutPercentage int    `json:"rollout_percentage"`
}

type ConfigDTO struct {
	Key   string          `json:"key"`
	Value json.RawMessage `json:"value"`
}

type ProjectRuntimeDTO struct {
	Project struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"project"`
	Flags   []FlagDTO   `json:"flags"`
	Configs []ConfigDTO `json:"configs"`
}

type PublicRuntimeDTO struct {
	Flags  map[string]bool            `json:"flags"`
	Config map[string]json.RawMessage `json:"config"`
}

type UpsertFlagParams struct {
	Enabled           bool `json:"enabled"`
	RolloutPercentage int  `json:"rollout_percentage"`
}

type UpsertConfigParams struct {
	Value json.RawMessage `json:"value"`
}
