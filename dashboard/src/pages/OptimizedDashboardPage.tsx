import { RefreshCw } from "lucide-react";
import { useStore } from "../store";
import { Button } from "../components/ui/button";
import { DashboardCounts } from "../components/dashboard/DashboardCounts";
import { DashboardChart } from "../components/dashboard/DashboardChart";
import { AnalyticsBreakdown } from "../components/dashboard/AnalyticsBreakdown";
import { TopPages } from "../components/dashboard/TopPages";
import { RecentEvents } from "../components/dashboard/RecentEvents";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../hooks/useApi";

export function OptimizedDashboardPage() {
  const { currentProject } = useStore();
  const queryClient = useQueryClient();

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="text-center">
          <p className="text-foreground text-lg">No project selected</p>
          <p className="text-muted-foreground text-sm mt-2">
            Create a project to get started
          </p>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    // Invalidate all dashboard data for the current project
    queryClient.invalidateQueries({
      queryKey: queryKeys.counts(currentProject.id),
    });
    queryClient.invalidateQueries({
      queryKey: ["chartData", currentProject.id],
      exact: false,
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.deviceAnalytics(currentProject.id),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.trafficSources(currentProject.id),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.topPages(currentProject.id),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.recentEventsFormatted(currentProject.id),
      exact: false,
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time insights for {currentProject.name}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overview Counts */}
      <DashboardCounts projectId={currentProject.id} />

      {/* Chart Section */}
      <DashboardChart projectId={currentProject.id} />

      {/* Analytics Breakdown */}
      <AnalyticsBreakdown projectId={currentProject.id} />

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopPages projectId={currentProject.id} />
        <RecentEvents projectId={currentProject.id} />
      </div>
    </div>
  );
}
