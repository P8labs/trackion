package projects

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

func (h *handler) CreateProject(w http.ResponseWriter, r *http.Request) {
	body, err := json.Parse[CreateProjectParams](r)

	if err != nil {
		log.Println(err)
		json.Error(w, err.Error(), 400)
		return
	}

	id, err := h.service.CreateProject(r.Context(), body)
	if err != nil {
		log.Println(err)
		json.Error(w, err.Error(), 400)
		return
	}

	json.Success(w, json.M{"projectId": id}, "Project created successfully.")
}
