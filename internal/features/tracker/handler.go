package tracker

import (
	"bytes"
	"net/http"
	"time"
	"trackion/internal/static"
)

func ServeTracker(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/javascript")
	w.Header().Set("Cache-Control", "public, max-age=86400")
	w.Header().Set("ETag", "trackion-v1")

	http.ServeContent(
		w,
		r,
		"t.js",
		time.Now(),
		bytes.NewReader(static.TrackerJS),
	)
}

func ServeTrackerMin(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/javascript")
	w.Header().Set("Cache-Control", "public, max-age=86400")
	w.Header().Set("ETag", "trackion-min-v1")

	http.ServeContent(
		w,
		r,
		"t.min.js",
		time.Now(),
		bytes.NewReader(static.TrackerMinJS),
	)
}
