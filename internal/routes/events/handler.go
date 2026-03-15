package events

import (
	"log"
	"net/http"
	"trackion/internal/json"
)

type handler struct {
	service Service
}

func NewHandler(service Service) *handler {
	return &handler{
		service: service,
	}
}

func (h *handler) CollectEvent(w http.ResponseWriter, r *http.Request) {
	body, err := json.Parse[AddEventParams](r)

	if err != nil {
		log.Println(err)
		json.Error(w, err.Error(), 400)
		return
	}

	id, err := h.service.CreateEvent(r.Context(), body)
	if err != nil {
		log.Println(err)
		json.Error(w, err.Error(), 400)
		return
	}

	json.Success(w, json.M{"eventId": id}, "event recorded.")
}
