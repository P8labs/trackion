import { createApi } from "../api";

export const analyticsQueryKeys = {
  onlineUsers: (projectId: string) =>
    ["analytics", projectId, "onlineUsers"] as const,
};

export function createAnalyticsQueries(api: ReturnType<typeof createApi>) {
  return {
    onlineUsers: (projectId: string) => ({
      queryKey: analyticsQueryKeys.onlineUsers(projectId),
      queryFn: () => api.getOnlineUsers(projectId),
      refetchInterval: 30000, // Refetch every 30 seconds
    }),
  };
}
