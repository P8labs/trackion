package projects

import (
	"log"
	"net/http"
	"trackion/internal/res"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
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

	res.Success(w, res.M{"id": id}, "Project created successfully.")
}

func (h *handler) GetProjectDetails(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	if _, err := uuid.Parse(projectId); err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 404)
		return
	}

	project, err := h.service.GetProject(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	res.Success(w, ToProjectResponse(project), "Project details fetched successfully.")
}

func (h *handler) ListUserProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := h.service.GetUserProjects(r.Context())
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	res.Success(w, ToProjectResponseList(projects), "Projects fetched successfully.")
}

func (h *handler) UpdateProject(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")
	body, err := res.Parse[UpdateProjectRequest](r)

	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	// Convert request to service parameters
	params := UpdateProjectParams{
		Name:    body.Name,
		Domains: body.Domains,
	}

	// Handle nested settings structure
	if body.Settings != nil {
		params.AutoPageview = &body.Settings.AutoPageview
		params.TrackTimeSpent = &body.Settings.TrackTimeSpent
		params.TrackCampaign = &body.Settings.TrackCampaign
		params.TrackClicks = &body.Settings.TrackClicks
	}

	err = h.service.UpdateProject(r.Context(), projectId, params)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	res.Success(w, res.M{}, "Project updated successfully.")
}

func (h *handler) DeleteProject(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "id")

	err := h.service.DeleteProject(r.Context(), projectId)
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), 400)
		return
	}

	res.Success(w, res.M{}, "Project deleted successfully.")
}
