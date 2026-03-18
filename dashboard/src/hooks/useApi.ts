import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../store";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getDashboardData,
  getEvents,
  getDashboardStats,
  getChartData,
  getBreakdownData,
  getRecentEvents,
  getDashboardCounts,
  getChartDataFlexible,
  getDeviceAnalytics,
  getTrafficSources,
  getTopPages,
  getRecentEventsFormatted,
} from "../lib/api";
import type { ProjectSettings, UpdateProject } from "../types";

// Query Keys
export const queryKeys = {
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  dashboard: (projectId: string) => ["dashboard", projectId] as const,
  events: (projectId: string, limit?: number) =>
    ["events", projectId, limit] as const,
  stats: (projectId: string) => ["stats", projectId] as const,
  chart: (projectId: string, timeRange: string, eventFilter: string) =>
    ["chart", projectId, timeRange, eventFilter] as const,
  breakdown: (projectId: string) => ["breakdown", projectId] as const,
  recentEvents: (projectId: string, limit?: number) =>
    ["recentEvents", projectId, limit] as const,

  // New optimized endpoints
  counts: (projectId: string) => ["counts", projectId] as const,
  chartData: (projectId: string, timeRange: string, eventFilter: string) =>
    ["chartData", projectId, timeRange, eventFilter] as const,
  deviceAnalytics: (projectId: string) =>
    ["deviceAnalytics", projectId] as const,
  trafficSources: (projectId: string) => ["trafficSources", projectId] as const,
  topPages: (projectId: string) => ["topPages", projectId] as const,
  recentEventsFormatted: (projectId: string, limit?: number) =>
    ["recentEventsFormatted", projectId, limit] as const,
};

// Custom hooks for queries
export function useProjects() {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => getProjects(serverUrl, authToken!),
    enabled: !!authToken,
  });
}

export function useProject(id: string) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => getProject(id, serverUrl, authToken!),
    enabled: !!authToken && !!id,
  });
}

export function useDashboardData(projectId: string) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.dashboard(projectId),
    queryFn: () => getDashboardData(projectId, serverUrl, authToken!),
    enabled: !!authToken && !!projectId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useEvents(projectId: string, limit = 50) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.events(projectId, limit),
    queryFn: () => getEvents(projectId, serverUrl, authToken!, limit),
    enabled: !!authToken && !!projectId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time feel
  });
}

// Custom hooks for mutations
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { authToken, serverUrl } = useStore();

  return useMutation({
    mutationFn: (data: {
      name: string;
      domains: string[];
      settings: ProjectSettings;
    }) => createProject(data, serverUrl, authToken!),
    onSuccess: () => {
      // Invalidate projects query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  const { authToken, serverUrl } = useStore();

  return useMutation({
    mutationFn: (data: Partial<UpdateProject>) =>
      updateProject(projectId, data, serverUrl, authToken!),
    onSuccess: (updatedProject) => {
      // Update the specific project in cache
      queryClient.setQueryData(queryKeys.project(projectId), updatedProject);
      // Invalidate projects list to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      // Invalidate dashboard data as project settings might affect it
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard(projectId),
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { authToken, serverUrl } = useStore();

  return useMutation({
    mutationFn: (projectId: string) =>
      deleteProject(projectId, serverUrl, authToken!),
    onSuccess: (_, projectId) => {
      // Remove the project from cache
      queryClient.removeQueries({ queryKey: queryKeys.project(projectId) });
      // Remove dashboard data for this project
      queryClient.removeQueries({ queryKey: queryKeys.dashboard(projectId) });
      // Remove events data for this project
      queryClient.removeQueries({
        queryKey: ["events", projectId],
        exact: false,
      });
      // Invalidate projects list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

// Utility hook to invalidate all data for a project
export function useInvalidateProjectData() {
  const queryClient = useQueryClient();

  return (projectId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard(projectId),
    });
    queryClient.invalidateQueries({
      queryKey: ["events", projectId],
      exact: false,
    });
  };
}

// New analytics hooks
export function useDashboardStats(projectId: string) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.stats(projectId),
    queryFn: () => getDashboardStats(projectId, serverUrl, authToken!),
    enabled: !!authToken && !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useChartData(
  projectId: string,
  timeRange: string,
  eventFilter: string,
) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.chart(projectId, timeRange, eventFilter),
    queryFn: () =>
      getChartData(projectId, timeRange, eventFilter, serverUrl, authToken!),
    enabled: !!authToken && !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useBreakdownData(projectId: string) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.breakdown(projectId),
    queryFn: () => getBreakdownData(projectId, serverUrl, authToken!),
    enabled: !!authToken && !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentEventsData(projectId: string, limit = 20) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.recentEvents(projectId, limit),
    queryFn: () => getRecentEvents(projectId, serverUrl, authToken!, limit),
    enabled: !!authToken && !!projectId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// New optimized dashboard hooks
export function useDashboardCounts(projectId: string) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.counts(projectId),
    queryFn: () => getDashboardCounts(projectId, serverUrl, authToken!),
    enabled: !!authToken && !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useChartDataFlexible(
  projectId: string,
  timeRange: string = "24h",
  eventFilter: string = "",
) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.chartData(projectId, timeRange, eventFilter),
    queryFn: () =>
      getChartDataFlexible(projectId, timeRange, eventFilter, serverUrl, authToken!),
    enabled: !!authToken && !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

export function useDeviceAnalytics(projectId: string) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.deviceAnalytics(projectId),
    queryFn: () => getDeviceAnalytics(projectId, serverUrl, authToken!),
    enabled: !!authToken && !!projectId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTrafficSources(projectId: string) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.trafficSources(projectId),
    queryFn: () => getTrafficSources(projectId, serverUrl, authToken!),
    enabled: !!authToken && !!projectId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTopPages(projectId: string) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.topPages(projectId),
    queryFn: () => getTopPages(projectId, serverUrl, authToken!),
    enabled: !!authToken && !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentEventsFormatted(projectId: string, limit = 50) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.recentEventsFormatted(projectId, limit),
    queryFn: () => getRecentEventsFormatted(projectId, serverUrl, authToken!, limit),
    enabled: !!authToken && !!projectId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}
