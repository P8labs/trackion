import { useAppQuery, useQueries } from "../use-queries";

export const analyticsHooks = {
  useOnlineUsers(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.analytics.onlineUsers(projectId));
  },
};
