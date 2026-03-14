package main

import (
	"fmt"
	"net/http"
)

func health(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Ok")
}

func main() {
	http.HandleFunc("/health", health)
	fmt.Println("Trackion ingestor running")

	http.ListenAndServe(":3000", nil)

}
