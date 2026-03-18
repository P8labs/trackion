import type {
  Project,
  ProjectSettings,
  DashboardData,
  Event,
  UpdateProject,
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
