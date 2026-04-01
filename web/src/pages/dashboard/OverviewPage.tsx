import { lazy, Suspense, useEffect, useState } from "react";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useStore } from "../../store";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { OnlineUsers } from "../../components/dashboard/OnlineUsers";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, useProject } from "../../hooks/useApi";
import { useNavigate, useParams } from "react-router-dom";
import { PLine } from "@/components/Line";

const DashboardCounts = lazy(() =>
  import("../../components/dashboard/DashboardCounts").then((m) => ({
    default: m.DashboardCounts,
  })),
);
const DashboardChart = lazy(() =>
  import("../../components/dashboard/DashboardChart").then((m) => ({
    default: m.DashboardChart,
  })),
);
const OverviewGeoTraffic = lazy(() =>
  import("../../components/dashboard/OverviewGeoTraffic").then((m) => ({
    default: m.OverviewGeoTraffic,
  })),
);

export function OverviewPage() {
  const { id } = useParams<{ id: string }>();
  const { currentProject, setCurrentProject } = useStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: projectFromRoute } = useProject(id || "");
  const [refreshing, setRefreshing] = useState(false);

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
              onClick={() => navigate("/projects")}
              className="w-full h-11 text-base"
            >
              Go to Projects
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.counts(activeProject.id),
      }),
      queryClient.invalidateQueries({
        queryKey: ["chartData", activeProject.id],
        exact: false,
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.areaChartData(activeProject.id, "24h", ""),
        exact: false,
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.deviceAnalytics(activeProject.id),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.trafficSources(activeProject.id),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.topPages(activeProject.id),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.recentEventsFormatted(activeProject.id),
        exact: false,
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.onlineUsers(activeProject.id),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.countryData(activeProject.id),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.countryMapData(activeProject.id),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.trafficHeatmap(activeProject.id),
      }),
    ]);

    setRefreshing(false);
  };

  return (
    <section className="max-w-6xl mx-auto relative">
      <PLine />
      <div className="px-4 md:px-6 py-6 border-b border-border/60 relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Overview
            </p>

            <h1 className="mt-1 text-xl font-medium tracking-tight md:text-2xl">
              {activeProject.name}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Real-time analytics and insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OnlineUsers projectId={activeProject.id} />

            <Button
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-9 gap-2 px-3 text-sm"
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      <div className="relative">
        <Suspense fallback={<OverviewCardFallback heightClass="h-32" />}>
          <DashboardCounts projectId={activeProject.id} />
        </Suspense>
        <Suspense fallback={<OverviewCardFallback heightClass="h-80" />}>
          <DashboardChart projectId={activeProject.id} />
        </Suspense>
        <Suspense fallback={<OverviewCardFallback heightClass="h-[28rem]" />}>
          <OverviewGeoTraffic projectId={activeProject.id} />
        </Suspense>
      </div>
    </section>
  );
}

function OverviewCardFallback({ heightClass }: { heightClass: string }) {
  return (
    <Card className="border-border/60">
      <div className={`w-full animate-pulse bg-muted/25 ${heightClass}`} />
    </Card>
  );
}
