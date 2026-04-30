import { createApi } from "../api";
import { CreateProjectInput } from "../types";

export const projectQueryKeys = {
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  projectRuntime: (projectId: string) =>
    ["projects", projectId, "runtime"] as const,
  replaySessions: (projectId: string, limit: number) =>
    ["projects", projectId, "replay-sessions", limit] as const,
  replaySession: (projectId: string, sessionId: string) =>
    ["projects", projectId, "replay-sessions", sessionId] as const,

  errorGroups: (projectId: string, timeRange: string) =>
    ["projects", projectId, "error-groups", timeRange] as const,
  errorDetail: (projectId: string, stackId: string) =>
    ["projects", projectId, "error-details", stackId] as const,
  errorStats: (projectId: string) =>
    ["projects", projectId, "error-stats"] as const,
};

export function createProjectQueries(api: ReturnType<typeof createApi>) {
  return {
    projects: () => ({
      queryKey: projectQueryKeys.projects,
      queryFn: api.getProjects,
    }),
    project: (id: string) => ({
      queryKey: projectQueryKeys.project(id),
      queryFn: () => api.getProject(id),
    }),

    projectRuntime: (projectId: string) => ({
      queryKey: projectQueryKeys.projectRuntime(projectId),
      queryFn: () => api.getProjectRuntime(projectId),
    }),

    replaySessions: (
      projectId: string,
      limit: number,
      refetchInterval?: number,
    ) => ({
      queryKey: projectQueryKeys.replaySessions(projectId, limit),
      queryFn: () => api.getReplays(projectId, limit),
      refetchInterval,
    }),

    replaySession: (projectId: string, sessionId: string) => ({
      queryKey: projectQueryKeys.replaySession(projectId, sessionId),
      queryFn: () => api.getReplaySession(projectId, sessionId),
    }),

    errorGroups: (projectId: string, timeRange: string) => ({
      queryKey: projectQueryKeys.errorGroups(projectId, timeRange),
      queryFn: () => api.getErrors(projectId, timeRange),
    }),

    errorDetail: (projectId: string, stackId: string) => ({
      queryKey: projectQueryKeys.errorDetail(projectId, stackId),
      queryFn: () => api.getErrorDetail(projectId, stackId),
    }),

    errorStats: (projectId: string) => ({
      queryKey: projectQueryKeys.errorStats(projectId),
      queryFn: () => api.getErrorStats(projectId),
    }),
  };
}

export function createProjectMutations(api: ReturnType<typeof createApi>) {
  return {
    createProject: () => ({
      mutationFn: (data: CreateProjectInput) => api.createProject(data),
    }),
    editProject: (id: string) => ({
      mutationFn: (data: CreateProjectInput) => api.updateProject(id, data),
    }),
    deleteProject: (id: string) => ({
      mutationFn: () => api.deleteProject(id),
    }),

    upsertRuntimeFlag: (projectId: string) => ({
      mutationFn: (params: {
        flagKey: string;
        enabled: boolean;
        rollout_percentage: number;
      }) =>
        api.upsertRuntimeFlag(projectId, params.flagKey, {
          enabled: params.enabled,
          rollout_percentage: params.rollout_percentage,
        }),
    }),

    deleteRuntimeFlag: (projectId: string) => ({
      mutationFn: (flagKey: string) =>
        api.deleteRuntimeFlag(projectId, flagKey),
    }),

    upsertRuntimeConfig: (projectId: string) => ({
      mutationFn: (params: { configKey: string; value: string }) =>
        api.upsertRuntimeConfig(projectId, params.configKey, {
          value: params.value,
        }),
    }),

    deleteRuntimeConfig: (projectId: string) => ({
      mutationFn: (configKey: string) =>
        api.deleteRuntimeConfig(projectId, configKey),
    }),

    deleteReplaySession: (projectId: string) => ({
      mutationFn: (sessionId: string) =>
        api.deleteReplaySession(projectId, sessionId),
    }),
  };
}
