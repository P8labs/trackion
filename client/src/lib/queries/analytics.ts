import { createApi } from "../api";

export const analyticsQueryKeys = {
  onlineUsers: (projectId: string) =>
    ["analytics", projectId, "onlineUsers"] as const,
  stats: (projectId: string) => ["analytics", projectId, "stats"] as const,
  chartData: (projectId: string, timeRange: string, eventFilter: string) =>
    ["analytics", projectId, "chartData", timeRange, eventFilter] as const,

  countryMapData: (projectId: string) =>
    ["analytics", projectId, "countryMapData"] as const,

  trafficHeatmap: (projectId: string) =>
    ["analytics", projectId, "trafficHeatmap"] as const,

  recentEvents: (projectId: string, page: number, pageSize: number) =>
    ["analytics", projectId, "recentEvents", page, pageSize] as const,
  realtimeEvents: (projectId: string, limit: number) =>
    ["analytics", projectId, "realtimeEvents", limit] as const,

  deviceTraffic: (projectId: string) =>
    ["analytics", projectId, "deviceTraffic"] as const,
  trafficSources: (projectId: string) =>
    ["analytics", projectId, "trafficSources"] as const,

  topCountries: (projectId: string) =>
    ["analytics", projectId, "topCountries"] as const,

  topPages: (projectId: string) =>
    ["analytics", projectId, "topPages"] as const,
};

export function createAnalyticsQueries(api: ReturnType<typeof createApi>) {
  return {
    onlineUsers: (projectId: string) => ({
      queryKey: analyticsQueryKeys.onlineUsers(projectId),
      queryFn: () => api.getOnlineUsers(projectId),
      refetchInterval: 30000,
    }),

    stats: (projectId: string) => ({
      queryKey: analyticsQueryKeys.stats(projectId),
      queryFn: () => api.getDashboardCounts(projectId),
      refetchInterval: 30000,
    }),

    chartData: (projectId: string, timeRange: string, eventFilter: string) => ({
      queryKey: analyticsQueryKeys.chartData(projectId, timeRange, eventFilter),
      queryFn: () => api.getChartData(projectId, timeRange, eventFilter),
    }),

    countryMapData: (projectId: string) => ({
      queryKey: analyticsQueryKeys.countryMapData(projectId),
      queryFn: () => api.getCountryMapData(projectId),
    }),

    trafficHeatmap: (projectId: string) => ({
      queryKey: analyticsQueryKeys.trafficHeatmap(projectId),
      queryFn: () => api.getTrafficHeatmap(projectId),
    }),

    recentEvents: (projectId: string, page = 1, pageSize = 20) => ({
      queryKey: analyticsQueryKeys.recentEvents(projectId, page, pageSize),
      queryFn: () => api.getRecentEvents(projectId, page, pageSize),
    }),

    realtimeEvents: (projectId: string, limit = 10) => ({
      queryKey: analyticsQueryKeys.realtimeEvents(projectId, limit),
      queryFn: () => api.getRealtimeEvents(projectId, limit),
    }),

    deviceTraffic: (projectId: string) => ({
      queryKey: analyticsQueryKeys.deviceTraffic(projectId),
      queryFn: () => api.getDeviceAnalytics(projectId),
    }),

    trafficSources: (projectId: string) => ({
      queryKey: analyticsQueryKeys.trafficSources(projectId),
      queryFn: () => api.getTrafficSources(projectId),
    }),

    topCountries: (projectId: string) => ({
      queryKey: analyticsQueryKeys.topCountries(projectId),
      queryFn: () => api.getTopCountries(projectId),
    }),

    topPages: (projectId: string) => ({
      queryKey: analyticsQueryKeys.topPages(projectId),
      queryFn: () => api.getTopPages(projectId),
    }),
  };
}
