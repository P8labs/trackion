package settings

import (
	"log"
	"net/http"
	"trackion/internal/res"
)

type handler struct {
	service Service
}

func NewHandler(service Service) *handler {
	return &handler{service: service}
}

func (h *handler) GetUsageSummary(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.GetUsageSummary(r.Context())
	if err != nil {
		log.Println(err)
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res.Success(w, data, "Usage fetched successfully")
}
