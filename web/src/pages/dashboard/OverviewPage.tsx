import { RefreshCw } from "lucide-react";
import { useStore } from "../../store";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { DashboardCounts } from "../../components/dashboard/DashboardCounts";
import { DashboardChart } from "../../components/dashboard/DashboardChart";
import { AnalyticsBreakdown } from "../../components/dashboard/AnalyticsBreakdown";
import { TopPages } from "../../components/dashboard/TopPages";
import { RecentEvents } from "../../components/dashboard/RecentEvents";
import { OnlineUsers } from "../../components/dashboard/OnlineUsers";
import { OverviewGeoTraffic } from "../../components/dashboard/OverviewGeoTraffic";
import { WorldMap } from "../../components/dashboard/WorldMap";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, useProject } from "../../hooks/useApi";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export function OverviewPage() {
  const { id } = useParams<{ id: string }>();
  const { currentProject, setCurrentProject } = useStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: projectFromRoute } = useProject(id || "");

  useEffect(() => {
    if (!projectFromRoute || !id) {
      return;
    }

    if (currentProject?.id !== projectFromRoute.id) {
      setCurrentProject(projectFromRoute);
    }
  }, [currentProject?.id, id, projectFromRoute, setCurrentProject]);

  const activeProject = id
    ? projectFromRoute || (currentProject?.id === id ? currentProject : null)
    : currentProject;

  const sectionParam = searchParams.get("section") || "overview";
  const section = ["overview", "events", "breakdown", "realtime"].includes(
    sectionParam,
  )
    ? sectionParam
    : "overview";

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Card className="p-12 text-center max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Select a project to continue
            </h2>
            <p className="text-muted-foreground mb-6">
              Open the project list and choose a project to view analytics,
              events, and usage insights.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full h-11 text-base"
            >
              Go to Projects
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.counts(activeProject.id),
    });
    queryClient.invalidateQueries({
      queryKey: ["chartData", activeProject.id],
      exact: false,
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.deviceAnalytics(activeProject.id),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.trafficSources(activeProject.id),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.topPages(activeProject.id),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.recentEventsFormatted(activeProject.id),
      exact: false,
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.onlineUsers(activeProject.id),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.countryData(activeProject.id),
    });
  };

  return (
    <div className="space-y-4 p-4 md:p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {activeProject.name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OnlineUsers projectId={activeProject.id} />
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="h-10 px-4 gap-2 text-sm"
          >
            <RefreshCw className="h-5 w-5" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {section === "overview" && (
          <>
            <DashboardCounts projectId={activeProject.id} />
            <DashboardChart projectId={activeProject.id} />
            <OverviewGeoTraffic projectId={activeProject.id} />
          </>
        )}

        {section === "events" && (
          <>
            <DashboardCounts projectId={activeProject.id} />
            <RecentEvents projectId={activeProject.id} />
          </>
        )}

        {section === "breakdown" && (
          <>
            <AnalyticsBreakdown projectId={activeProject.id} />
            <div className="grid gap-4 lg:grid-cols-2">
              <WorldMap projectId={activeProject.id} />
              <TopPages projectId={activeProject.id} />
            </div>
          </>
        )}

        {section === "realtime" && (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Realtime Status</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active sessions and latest event activity
                  </p>
                </div>
                <OnlineUsers projectId={activeProject.id} />
              </div>
            </Card>

            <RecentEvents projectId={activeProject.id} />
          </>
        )}
      </div>
    </div>
  );
}
