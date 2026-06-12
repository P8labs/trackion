import { useAppQuery, useQueries } from "../use-queries";

export const analyticsHooks = {
  useOnlineUsers(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.analytics.onlineUsers(projectId));
  },

  useDashboardStats(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.analytics.stats(projectId));
  },

  useChartData(projectId: string, timeRange: string, eventFilter: string) {
    const q = useQueries();
    return useAppQuery(
      q.analytics.chartData(projectId, timeRange, eventFilter),
    );
  },

  useCountryMapData(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.analytics.countryMapData(projectId));
  },
  useTrafficHeatmap(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.analytics.trafficHeatmap(projectId));
  },
  useRecentEvents(projectId: string, page = 1, pageSize = 20) {
    const q = useQueries();
    return useAppQuery(q.analytics.recentEvents(projectId, page, pageSize));
  },

  useRealtimeEvents(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.analytics.realtimeEvents(projectId, 10), {
      staleTime: 5 * 1000,
      refetchInterval: 5 * 1000,
    });
  },

  useDeviceAnalytics(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.analytics.deviceTraffic(projectId));
  },

  useTrafficSources(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.analytics.trafficSources(projectId));
  },

  useTopCountries(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.analytics.topCountries(projectId));
  },

  useTopPages(projectId: string) {
    const q = useQueries();
    return useAppQuery(q.analytics.topPages(projectId));
  },
};
