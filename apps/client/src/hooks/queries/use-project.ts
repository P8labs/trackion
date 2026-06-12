import {
  useAppMutation,
  useAppQuery,
  useMutations,
  useQueries,
} from "../use-queries";

export const projectHooks = {
  useProjects() {
    const q = useQueries();
    return useAppQuery(q.project.projects());
  },
  useProject(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.project.project(projectId));
  },

  useProjectRuntime(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.project.projectRuntime(projectId));
  },

  useReplaySessions(
    projectId: string,
    limit: number,
    refetchInterval?: number,
  ) {
    const q = useQueries();
    return useAppQuery(
      q.project.replaySessions(projectId, limit, refetchInterval),
    );
  },

  useReplaySession(projectId: string, sessionId: string) {
    const q = useQueries();
    return useAppQuery(q.project.replaySession(projectId, sessionId), {
      enabled: !!sessionId,
    });
  },

  useErrorGroups(projectId: string, timeRange: string) {
    const q = useQueries();
    return useAppQuery(q.project.errorGroups(projectId, timeRange));
  },

  useErrorDetail(projectId: string, stackId: string) {
    const q = useQueries();
    return useAppQuery(q.project.errorDetail(projectId, stackId));
  },

  useErrorStats(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.project.errorStats(projectId));
  },

  useCreateProject() {
    const m = useMutations();
    return useAppMutation(m.project.createProject());
  },

  useEditProject(projectId: string) {
    const m = useMutations();
    return useAppMutation(m.project.editProject(projectId));
  },

  useDeleteProject(projectId: string) {
    const m = useMutations();
    return useAppMutation(m.project.deleteProject(projectId));
  },

  useUpsertRuntimeFlag(projectId: string) {
    const m = useMutations();
    return useAppMutation(m.project.upsertRuntimeFlag(projectId));
  },

  useDeleteRuntimeFlag(projectId: string) {
    const m = useMutations();
    return useAppMutation(m.project.deleteRuntimeFlag(projectId));
  },

  useUpsertRuntimeConfig(projectId: string) {
    const m = useMutations();
    return useAppMutation(m.project.upsertRuntimeConfig(projectId));
  },

  useDeleteRuntimeConfig(projectId: string) {
    const m = useMutations();
    return useAppMutation(m.project.deleteRuntimeConfig(projectId));
  },

  useDeleteReplaySession(projectId: string) {
    const m = useMutations();
    return useAppMutation(m.project.deleteReplaySession(projectId));
  },
};
