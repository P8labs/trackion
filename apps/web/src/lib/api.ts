import type {
  Project,
  ProjectSettings,
  ProjectRuntime,
  UpdateProject,
  ChartDataPoint,
  AreaChartDataPoint,
  RecentEventData,
  PaginatedEventsResponse,
  CountryDataItem,
  CountryMapData,
  TrafficHeatmapData,
  UsageSummary,
  User,
  ServerHealth,
  GroupedError,
  ErrorOccurrence,
  ErrorStats,
  UsagePlan,
  PlanInfo,
  ReplaySessionSummary,
  ReplaySessionPayload,
} from "../types";
import { SERVER_URL } from "./constants";

const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
  serverUrl: string,
  authToken: string | null,
): Promise<T> => {
  const headers = {
    "Content-Type": "application/json",
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...options.headers,
  };

  const response = await fetch(`${serverUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(data.message);
  }
  return data.data;
};

export const loginWithToken = async (
  token: string,
  serverUrl: string,
): Promise<{ token: string; user?: any }> => {
  return apiCall(
    "/api/auth/verify",
    {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    serverUrl,
    null,
  );
};

export const getGithubLoginUrl = (serverUrl = SERVER_URL): string => {
  return `${serverUrl}/auth/login/github?client=web`;
};

export const getGoogleLoginUrl = (serverUrl = SERVER_URL): string => {
  return `${serverUrl}/auth/login/google?client=web`;
};

export const logout = async (
  serverUrl: string,
  authToken: string,
): Promise<void> => {
  await apiCall("/api/auth/logout", { method: "POST" }, serverUrl, authToken);
};

export const getCurrentUser = async (
  serverUrl: string,
  authToken: string,
): Promise<User> => {
  return apiCall<User>("/auth/me", {}, serverUrl, authToken);
};

export const getProjects = async (
  serverUrl: string,
  authToken: string,
): Promise<Project[]> => {
  return apiCall<Project[]>("/api/projects", {}, serverUrl, authToken);
};

export const getProject = async (
  id: string,
  serverUrl: string,
  authToken: string,
): Promise<Project> => {
  return apiCall<Project>(`/api/projects/${id}`, {}, serverUrl, authToken);
};

export const createProject = async (
  data: {
    name: string;
    domains: string[];
    settings: ProjectSettings;
  },
  serverUrl: string,
  authToken: string,
): Promise<Project> => {
  return apiCall<Project>(
    "/api/projects",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    serverUrl,
    authToken,
  );
};

export const updateProject = async (
  id: string,
  data: Partial<UpdateProject>,
  serverUrl: string,
  authToken: string,
): Promise<Project> => {
  return apiCall<Project>(
    `/api/projects/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    serverUrl,
    authToken,
  );
};

export const deleteProject = async (
  id: string,
  serverUrl: string,
  authToken: string,
): Promise<void> => {
  return apiCall<void>(
    `/api/projects/${id}`,
    { method: "DELETE" },
    serverUrl,
    authToken,
  );
};

export const getDashboardCounts = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
): Promise<{
  total_events: number;
  views: number;
  unique_views: number;
  avg_time_spent_seconds: number;
}> => {
  return apiCall(
    `/api/analytics/${projectId}/counts`,
    {},
    serverUrl,
    authToken,
  );
};

export const getChartDataFlexible = async (
  projectId: string,
  timeRange: string,
  eventFilter: string,
  serverUrl: string,
  authToken: string,
): Promise<ChartDataPoint[]> => {
  const params = new URLSearchParams();
  params.append("time_range", timeRange);
  if (eventFilter) {
    params.append("event_filter", eventFilter);
  }

  return apiCall<ChartDataPoint[]>(
    `/api/analytics/${projectId}/chart-data?${params.toString()}`,
    {},
    serverUrl,
    authToken,
  );
};

export const getAreaChartData = async (
  projectId: string,
  timeRange: string,
  eventFilter: string,
  serverUrl: string,
  authToken: string,
): Promise<AreaChartDataPoint[]> => {
  const params = new URLSearchParams();
  params.append("time_range", timeRange);
  if (eventFilter) {
    params.append("event_filter", eventFilter);
  }

  return apiCall<AreaChartDataPoint[]>(
    `/api/analytics/${projectId}/area-chart-data?${params.toString()}`,
    {},
    serverUrl,
    authToken,
  );
};

export const getDeviceAnalytics = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
): Promise<{
  devices: Array<{ name: string; count: number; color?: string }>;
  browsers: Array<{ name: string; count: number; color?: string }>;
}> => {
  return apiCall(
    `/api/analytics/${projectId}/device-analytics`,
    {},
    serverUrl,
    authToken,
  );
};

export const getTrafficSources = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
): Promise<{
  referrers: Array<{ name: string; count: number; color?: string }>;
  countries: Array<{ name: string; count: number; color?: string }>;
  utm_sources: Array<{ name: string; count: number; color?: string }>;
  utm_mediums: Array<{ name: string; count: number; color?: string }>;
}> => {
  return apiCall(
    `/api/analytics/${projectId}/traffic-sources`,
    {},
    serverUrl,
    authToken,
  );
};

export const getTopPages = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
): Promise<
  Array<{
    path: string;
    total_views: number;
    unique_visitors: number;
    avg_time_seconds: number;
  }>
> => {
  return apiCall(
    `/api/analytics/${projectId}/top-pages`,
    {},
    serverUrl,
    authToken,
  );
};

export const getRecentEventsFormatted = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
  limit = 50,
): Promise<RecentEventData[]> => {
  return apiCall<RecentEventData[]>(
    `/api/analytics/${projectId}/recent-events?limit=${limit}`,
    {},
    serverUrl,
    authToken,
  );
};

export const getRecentEventsPaginated = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
  page = 1,
  pageSize = 20,
): Promise<PaginatedEventsResponse> => {
  return apiCall<PaginatedEventsResponse>(
    `/api/analytics/${projectId}/recent-events-paginated?page=${page}&page_size=${pageSize}`,
    {},
    serverUrl,
    authToken,
  );
};

export const getUsageSummary = async (
  serverUrl: string,
  authToken: string,
): Promise<UsageSummary> => {
  return apiCall<UsageSummary>("/api/settings/usage", {}, serverUrl, authToken);
};

export const getServerHealth = async (
  serverUrl: string,
): Promise<ServerHealth> => {
  return apiCall<ServerHealth>("/health", {}, serverUrl, null);
};

export const getOnlineUsers = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
): Promise<{ online_users: number }> => {
  return apiCall(
    `/api/analytics/${projectId}/online-users`,
    {},
    serverUrl,
    authToken,
  );
};

export const getCountryData = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
): Promise<CountryDataItem[]> => {
  return apiCall(
    `/api/analytics/${projectId}/country-data`,
    {},
    serverUrl,
    authToken,
  );
};

export const getCountryMapData = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
): Promise<CountryMapData> => {
  return apiCall(
    `/api/analytics/${projectId}/country-map-data`,
    {},
    serverUrl,
    authToken,
  );
};

export const getTrafficHeatmap = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
): Promise<TrafficHeatmapData> => {
  return apiCall(
    `/api/analytics/${projectId}/traffic-heatmap`,
    {},
    serverUrl,
    authToken,
  );
};

export const getProjectRuntime = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
): Promise<ProjectRuntime> => {
  return apiCall(
    `/api/runtime/projects/${projectId}/runtime`,
    {},
    serverUrl,
    authToken,
  );
};

export const upsertFeatureFlag = async (
  projectId: string,
  key: string,
  data: { enabled: boolean; rollout_percentage: number },
  serverUrl: string,
  authToken: string,
): Promise<void> => {
  return apiCall(
    `/api/runtime/projects/${projectId}/runtime/flags/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    serverUrl,
    authToken,
  );
};

export const deleteFeatureFlag = async (
  projectId: string,
  key: string,
  serverUrl: string,
  authToken: string,
): Promise<void> => {
  return apiCall(
    `/api/runtime/projects/${projectId}/runtime/flags/${encodeURIComponent(key)}`,
    {
      method: "DELETE",
    },
    serverUrl,
    authToken,
  );
};

export const upsertRemoteConfig = async (
  projectId: string,
  key: string,
  value: unknown,
  serverUrl: string,
  authToken: string,
): Promise<void> => {
  return apiCall(
    `/api/runtime/projects/${projectId}/runtime/config/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      body: JSON.stringify({ value }),
    },
    serverUrl,
    authToken,
  );
};

export const deleteRemoteConfig = async (
  projectId: string,
  key: string,
  serverUrl: string,
  authToken: string,
): Promise<void> => {
  return apiCall(
    `/api/runtime/projects/${projectId}/runtime/config/${encodeURIComponent(key)}`,
    {
      method: "DELETE",
    },
    serverUrl,
    authToken,
  );
};

// Error Tracking API
export const getGroupedErrors = async (
  projectId: string,
  timeRange: string = "7d",
  serverUrl: string,
  authToken: string,
): Promise<GroupedError[]> => {
  return apiCall<GroupedError[]>(
    `/api/errors?project_id=${projectId}&time_range=${timeRange}`,
    {},
    serverUrl,
    authToken,
  );
};

export const getErrorOccurrences = async (
  projectId: string,
  fingerprint: string,
  serverUrl: string,
  authToken: string,
): Promise<ErrorOccurrence[]> => {
  return apiCall<ErrorOccurrence[]>(
    `/api/errors/${fingerprint}?project_id=${projectId}`,
    {},
    serverUrl,
    authToken,
  );
};

export const getErrorStats = async (
  projectId: string,
  timeRange: string = "7d",
  serverUrl: string,
  authToken: string,
): Promise<ErrorStats> => {
  return apiCall<ErrorStats>(
    `/api/errors/stats?project_id=${projectId}&time_range=${timeRange}`,
    {},
    serverUrl,
    authToken,
  );
};

// Billing API functions
export const getUsage = async (
  serverUrl: string,
  authToken: string,
): Promise<UsagePlan> => {
  return apiCall<UsagePlan>(`/api/billing/usage`, {}, serverUrl, authToken);
};

export const getPlanInfo = async (
  serverUrl: string,
  authToken: string,
): Promise<PlanInfo> => {
  return apiCall<PlanInfo>(`/api/billing/plan`, {}, serverUrl, authToken);
};

export const upgradeToPro = async (
  serverUrl: string,
  authToken: string,
): Promise<{ message: string }> => {
  return apiCall<{ message: string }>(
    `/api/billing/upgrade`,
    {
      method: "POST",
    },
    serverUrl,
    authToken,
  );
};

export const getReplaySessions = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
  limit = 50,
): Promise<ReplaySessionSummary[]> => {
  return apiCall<ReplaySessionSummary[]>(
    `/api/replay/projects/${projectId}/sessions?limit=${limit}`,
    {},
    serverUrl,
    authToken,
  );
};

export const getReplaySession = async (
  projectId: string,
  sessionId: string,
  serverUrl: string,
  authToken: string,
): Promise<ReplaySessionPayload> => {
  return apiCall<ReplaySessionPayload>(
    `/api/replay/projects/${projectId}/sessions/${encodeURIComponent(sessionId)}`,
    {},
    serverUrl,
    authToken,
  );
};

export const deleteReplaySession = async (
  projectId: string,
  sessionId: string,
  serverUrl: string,
  authToken: string,
): Promise<void> => {
  return apiCall<void>(
    `/api/replay/projects/${projectId}/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: "DELETE",
    },
    serverUrl,
    authToken,
  );
};
