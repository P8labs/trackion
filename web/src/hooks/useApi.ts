import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../store";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getDashboardCounts,
  getChartDataFlexible,
  getAreaChartData,
  getDeviceAnalytics,
  getTrafficSources,
  getTopPages,
  getRecentEventsFormatted,
  getOnlineUsers,
  getCountryData,
} from "../lib/api";
import type { ProjectSettings, UpdateProject } from "../types";

export const queryKeys = {
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  counts: (projectId: string) => ["counts", projectId] as const,
  chartData: (projectId: string, timeRange: string, eventFilter: string) =>
    ["chartData", projectId, timeRange, eventFilter] as const,
  areaChartData: (projectId: string, timeRange: string, eventFilter: string) =>
    ["areaChartData", projectId, timeRange, eventFilter] as const,
  deviceAnalytics: (projectId: string) =>
    ["deviceAnalytics", projectId] as const,
  trafficSources: (projectId: string) => ["trafficSources", projectId] as const,
  topPages: (projectId: string) => ["topPages", projectId] as const,
  recentEventsFormatted: (projectId: string, limit?: number) =>
    ["recentEventsFormatted", projectId, limit] as const,
  onlineUsers: (projectId: string) => ["onlineUsers", projectId] as const,
  countryData: (projectId: string) => ["countryData", projectId] as const,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.counts(projectId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.chartData(projectId, "24h", ""),
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.areaChartData(projectId, "7d", ""),
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.deviceAnalytics(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.trafficSources(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.topPages(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.recentEventsFormatted(projectId),
        exact: false,
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
      queryClient.removeQueries({ queryKey: queryKeys.counts(projectId) });
      queryClient.removeQueries({
        queryKey: ["chartData", projectId],
        exact: false,
      });
      queryClient.removeQueries({
        queryKey: ["areaChartData", projectId],
        exact: false,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.deviceAnalytics(projectId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.trafficSources(projectId),
      });
      queryClient.removeQueries({ queryKey: queryKeys.topPages(projectId) });
      queryClient.removeQueries({
        queryKey: ["recentEventsFormatted", projectId],
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
    queryClient.invalidateQueries({ queryKey: queryKeys.counts(projectId) });
    queryClient.invalidateQueries({
      queryKey: ["chartData", projectId],
      exact: false,
    });
    queryClient.invalidateQueries({
      queryKey: ["areaChartData", projectId],
      exact: false,
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.deviceAnalytics(projectId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.trafficSources(projectId),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.topPages(projectId) });
    queryClient.invalidateQueries({
      queryKey: ["recentEventsFormatted", projectId],
      exact: false,
    });
  };
}
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
      getChartDataFlexible(
        projectId,
        timeRange,
        eventFilter,
        serverUrl,
        authToken!,
      ),
    enabled: !!authToken && !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

export function useAreaChartData(
  projectId: string,
  timeRange: string = "7d",
  eventFilter: string = "",
) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.areaChartData(projectId, timeRange, eventFilter),
    queryFn: () =>
      getAreaChartData(
        projectId,
        timeRange,
        eventFilter,
        serverUrl,
        authToken!,
      ),
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
    queryFn: () =>
      getRecentEventsFormatted(projectId, serverUrl, authToken!, limit),
    enabled: !!authToken && !!projectId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useOnlineUsers(projectId: string) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.onlineUsers(projectId),
    queryFn: () => getOnlineUsers(projectId, serverUrl, authToken!),
    enabled: !!authToken && !!projectId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useCountryData(projectId: string) {
  const { authToken, serverUrl } = useStore();

  return useQuery({
    queryKey: queryKeys.countryData(projectId),
    queryFn: () => getCountryData(projectId, serverUrl, authToken!),
    enabled: !!authToken && !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
