package projects

import (
	"log"
	"net/http"
	"trackion/internal/res"
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
	body, err := res.Parse[CreateProjectParams](r)

	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	id, err := h.service.CreateProject(r.Context(), body)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	res.Success(w, res.M{"projectId": id}, "Project created successfully.")
}
