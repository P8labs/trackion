import { createApi } from "../api";

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
  };
}
