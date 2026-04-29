import { useAppMutation, useAppQuery, useQueries } from "../use-queries";

export const projectHooks = {
  useProjects() {
    const q = useQueries();
    return useAppQuery(q.project.projects());
  },
  useProject(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.project.project(projectId));
  },

  useCreateProject() {
    const q = useQueries();
    return useAppMutation(q.project.createProject());
  },
};
