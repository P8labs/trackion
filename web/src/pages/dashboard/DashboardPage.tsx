import { RefreshCw, Plus, BarChart3 } from "lucide-react";
import { useStore } from "../../store";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { DashboardCounts } from "../../components/dashboard/DashboardCounts";
import { DashboardChart } from "../../components/dashboard/DashboardChart";
import { AnalyticsBreakdown } from "../../components/dashboard/AnalyticsBreakdown";
import { TopPages } from "../../components/dashboard/TopPages";
import { RecentEvents } from "../../components/dashboard/RecentEvents";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const { currentProject } = useStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Card className="p-12 text-center max-w-md">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-3">
            Welcome to Trackion
          </h2>
          <p className="text-muted-foreground mb-6">
            Create your first project to start tracking analytics and gain
            insights into your website's performance.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/projects")}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Project
            </Button>
            <p className="text-xs text-muted-foreground">
              Once you create a project, you'll see charts, metrics, and
              real-time analytics here.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const handleRefresh = () => {
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

      <DashboardCounts projectId={currentProject.id} />

      <DashboardChart projectId={currentProject.id} />

      <AnalyticsBreakdown projectId={currentProject.id} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopPages projectId={currentProject.id} />
        <RecentEvents projectId={currentProject.id} />
      </div>
    </div>
  );
}
