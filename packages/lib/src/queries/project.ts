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
  };
}
