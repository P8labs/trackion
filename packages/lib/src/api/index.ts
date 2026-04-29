import {
  PlanInfo,
  Project,
  SelfhostTokenResponse,
  ServerHealth,
  UsagePlan,
  User,
} from "../types";
import { createApiClient } from "./client";

export { createApiClient } from "./client";

export function createApi(api: ReturnType<typeof createApiClient>) {
  return {
    getServerHealth: () => api.apiCall<ServerHealth>("GET", "/api/health"),

    loginWithToken: (token: string) =>
      api.apiCall<SelfhostTokenResponse>("POST", "/api/auth/verify", {
        body: JSON.stringify({ token }),
      }),
    logout: () => api.apiCall<{}>("POST", "/auth/logout"),

    getCurrentUser: () => api.apiCall<User>("GET", "/auth/me"),

    getUsage: () => api.apiCall<UsagePlan>("GET", "/api/billing/usage"),
    getPlanInfo: () => api.apiCall<PlanInfo>("GET", "/api/billing/plan"),

    getProjects: () => api.apiCall<Project[]>("GET", "/api/projects"),
    getProject: (id: string) =>
      api.apiCall<Project>("GET", `/api/projects/${id}`),
    //

    //
    //
    //

    // createProject: (data: {
    //   name: string;
    //   domains: string[];
    //   settings: ProjectSettings;
    // }) =>
    //   api.apiCall<Project>("POST", "/api/projects", {
    //     body: JSON.stringify(data),
    //   }),

    // updateProject: (id: string, data: Partial<UpdateProject>) =>
    //   api.apiCall<Project>("PUT", `/api/projects/${id}`, {
    //     body: JSON.stringify(data),
    //   }),

    // deleteProject: (id: string) => api.apiCall("DELETE", `/api/projects/${id}`),

    // getDashboardCounts: (projectId: string) =>
    //   api.apiCall<DashboardStats>("GET", `/api/analytics/${projectId}/counts`),

    // getAreaChartData: (
    //   projectId: string,
    //   timeRange: string,
    //   eventFilter: string,
    // ) => {
    //   const params = new URLSearchParams();
    //   params.append("time_range", timeRange);
    //   if (eventFilter) {
    //     params.append("event_filter", eventFilter);
    //   }
    //   return api.apiCall<AreaChartDataPoint[]>(
    //     "GET",
    //     `/api/analytics/${projectId}/area-chart-data?${params.toString()}`,
    //   );
    // },

    // getDeviceAnalytics: (projectId: string) => {
    //   return api.apiCall<DeviceAnalytics>(
    //     "GET",
    //     `/api/analytics/${projectId}/device-analytics`,
    //   );
    // },

    // getTrafficSources: (projectId: string) => {
    //   return api.apiCall<TrafficSource>(
    //     "GET",
    //     `/api/analytics/${projectId}/traffic-sources`,
    //   );
    // },

    // getTopPages: (projectId: string) =>
    //   api.apiCall<Array<TopPage>>(
    //     "GET",
    //     `/api/analytics/${projectId}/top-pages`,
    //   ),

    // // TODO!! check for these to functions looks same
    // getRecentEventsFormatted: (projectId: string, limit = 50) =>
    //   api.apiCall<RecentEventData[]>(
    //     "GET",
    //     `/api/analytics/${projectId}/recent-events?limit=${limit}`,
    //   ),

    // getRecentEventsPaginated: (projectId: string, page = 1, pageSize = 20) =>
    //   api.apiCall<PaginatedEventsResponse>(
    //     "GET",
    //     `/api/analytics/${projectId}/recent-events-paginated?page=${page}&page_size=${pageSize}`,
    //   ),
  };
}
