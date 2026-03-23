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
import { queryKeys } from "../../hooks/useApi";
import { useNavigate, useSearchParams } from "react-router-dom";

export function OverviewPage() {
  const { currentProject } = useStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sectionParam = searchParams.get("section") || "overview";
  const section = ["overview", "events", "breakdown", "realtime"].includes(
    sectionParam,
  )
    ? sectionParam
    : "overview";

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Card className="p-12 text-center max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Welcome to Trackion
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your first project to start tracking analytics and gain
              insights into your website's performance.
            </p>
            <Button
              onClick={() => navigate("/projects/new")}
              className="w-full h-11 text-base"
            >
              Create Your First Project
            </Button>
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
    queryClient.invalidateQueries({
      queryKey: queryKeys.onlineUsers(currentProject.id),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.countryData(currentProject.id),
    });
  };

  return (
    <div className="space-y-4 p-4 md:p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentProject.name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OnlineUsers projectId={currentProject.id} />
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
            <DashboardCounts projectId={currentProject.id} />
            <DashboardChart projectId={currentProject.id} />
            <OverviewGeoTraffic projectId={currentProject.id} />
          </>
        )}

        {section === "events" && (
          <>
            <DashboardCounts projectId={currentProject.id} />
            <RecentEvents projectId={currentProject.id} />
          </>
        )}

        {section === "breakdown" && (
          <>
            <AnalyticsBreakdown projectId={currentProject.id} />
            <div className="grid gap-4 lg:grid-cols-2">
              <WorldMap projectId={currentProject.id} />
              <TopPages projectId={currentProject.id} />
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
                <OnlineUsers projectId={currentProject.id} />
              </div>
            </Card>

            <RecentEvents projectId={currentProject.id} />
          </>
        )}
      </div>
    </div>
  );
}
