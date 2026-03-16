package projects

import (
	"log"
	"net/http"
	"trackion/internal/res"

	"github.com/go-chi/chi/v5"
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

func (h *handler) GetProjectDetails(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	project, err := h.service.GetProject(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	res.Success(w, project, "Project created successfully.")
}
