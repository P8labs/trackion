import {
  CreateProjectInput,
  Project,
  ProjectRuntime,
  SelfhostTokenResponse,
  ServerHealth,
  UsagePlan,
  User,
} from "../types";
import { createApiClient } from "./client";

export function createApi(api: ReturnType<typeof createApiClient>) {
  return {
    getServerHealth: () => api.apiCall<ServerHealth>("GET", "/health"),
    loginWithToken: (token: string) =>
      api.apiCall<SelfhostTokenResponse>("POST", "/api/v1/auth/verify", {
        body: JSON.stringify({ token }),
      }),
    logout: () => api.apiCall<void>("POST", "/api/v1/auth/logout"),
    getCurrentUser: () => api.apiCall<User>("GET", "/api/v1/auth/me"),
    getUsage: () => api.apiCall<UsagePlan>("GET", "/api/v1/billing/usage"),

    getProjects: () => api.apiCall<Project[]>("GET", "/api/v1/projects"),
    getProject: (id: string) =>
      api.apiCall<Project>("GET", `/api/v1/projects/${id}`),
    createProject: (data: CreateProjectInput) =>
      api.apiCall<Project>("POST", "/api/v1/projects", {
        body: JSON.stringify(data),
      }),
    updateProject: (id: string, data: CreateProjectInput) =>
      api.apiCall<Project>("PUT", `/api/v1/projects/${id}`, {
        body: JSON.stringify(data),
      }),

    deleteProject: (id: string) =>
      api.apiCall<void>("DELETE", `/api/v1/projects/${id}`),

    getProjectRuntime: (projectId: string) =>
      api.apiCall<ProjectRuntime>(
        "GET",
        `/api/v1/projects/${projectId}/runtime`,
      ),

    // TODO NEED ATTENTION!
    getOnlineUsers: (projectId: string) =>
      api.apiCall<{ online_users: number }>(
        "GET",
        `/api/v1/analytics/${projectId}/online-users`,
      ),

    //

    //
    //
    //

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

export { createApiClient } from "./client";
