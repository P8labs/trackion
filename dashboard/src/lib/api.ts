import type {
  Project,
  ProjectSettings,
  DashboardData,
  Event,
  UpdateProject,
  DashboardStats,
  ChartDataPoint,
  BreakdownData,
  RecentEventData,
} from "../types";

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

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.status) {
    throw new Error(`API Error: ${data.message}`);
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
    },
    serverUrl,
    null,
  );
};

export const getGithubLoginUrl = (serverUrl: string): string => {
  return `${serverUrl}/auth/login/github?client=web`;
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

export const getDashboardData = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
): Promise<DashboardData> => {
  return apiCall<DashboardData>(
    `/api/analytics/${projectId}/dashboard`,
    {},
    serverUrl,
    authToken,
  );
};

export const getEvents = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
  limit = 50,
): Promise<Event[]> => {
  return apiCall<Event[]>(
    `/api/analytics/${projectId}/events?limit=${limit}`,
    {},
    serverUrl,
    authToken,
  );
};

// New analytics API calls
export const getDashboardStats = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
): Promise<DashboardStats> => {
  return apiCall<DashboardStats>(
    `/api/analytics/${projectId}/stats`,
    {},
    serverUrl,
    authToken,
  );
};

export const getChartData = async (
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
    `/api/analytics/${projectId}/chart?${params.toString()}`,
    {},
    serverUrl,
    authToken,
  );
};

export const getBreakdownData = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
): Promise<BreakdownData> => {
  return apiCall<BreakdownData>(
    `/api/analytics/${projectId}/breakdown`,
    {},
    serverUrl,
    authToken,
  );
};

export const getRecentEvents = async (
  projectId: string,
  serverUrl: string,
  authToken: string,
  limit = 20,
): Promise<RecentEventData[]> => {
  return apiCall<RecentEventData[]>(
    `/api/analytics/${projectId}/recent?limit=${limit}`,
    {},
    serverUrl,
    authToken,
  );
};

// New optimized API endpoints
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
