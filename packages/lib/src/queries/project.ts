import { createApi } from "../api";
import { ProjectSettings } from "../types";

export const projectQueryKeys = {
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
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
    createProject: () => ({
      mutationFn: (data: {
        name: string;
        domains: string[];
        settings: ProjectSettings;
      }) => api.createProject(data),
    }),
  };
}
