import { createApi } from "../api";
import { CreateProjectInput } from "../types";

export const projectQueryKeys = {
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  projectRuntime: (projectId: string) =>
    ["projects", projectId, "runtime"] as const,
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
  };
}
