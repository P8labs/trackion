package static

import _ "embed"

//go:embed t.js
var TrackerJS []byte

//go:embed t.min.js
var TrackerMinJS []byte
