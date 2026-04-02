package billing

import (
	"net/http"
	"trackion/internal/features/auth"
	"trackion/internal/res"

	"github.com/google/uuid"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetUsage(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(auth.UserIdContextKey).(string)
	userUUID := uuid.MustParse(userID)

	usage, err := h.service.GetUsage(r.Context(), userUUID)
	if err != nil {
		res.Error(w, "Unable to get usage statistics", http.StatusInternalServerError)
		return
	}

	res.Success(w, usage, "Usage retrieved successfully")
}

func (h *Handler) GetPlan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(auth.UserIdContextKey).(string)
	userUUID := uuid.MustParse(userID)

	planInfo, err := h.service.GetUserPlan(r.Context(), userUUID)
	if err != nil {
		res.Error(w, "Unable to get user plan", http.StatusInternalServerError)
		return
	}

	res.Success(w, planInfo, "Plan information retrieved successfully")
}

func (h *Handler) UpgradeToPro(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(auth.UserIdContextKey).(string)
	userUUID := uuid.MustParse(userID)

	err := h.service.UpgradeSubscription(r.Context(), userUUID)
	if err != nil {
		res.Error(w, "Unable to upgrade subscription", http.StatusInternalServerError)
		return
	}

	res.Success(w, map[string]string{"message": "Successfully upgraded to Pro plan"}, "Successfully upgraded to Pro plan")
}
