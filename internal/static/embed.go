package static

import _ "embed"

//go:embed t.js
var TrackerJS []byte

//go:embed t.min.js
var TrackerMinJS []byte

//go:embed plan.beta.json
var PlanBetaJSON []byte

//go:embed plan.paid.json
var PlanPaidJSON []byte

//go:embed plan.unlimited.json
var PlanUnlimitedJSON []byte
