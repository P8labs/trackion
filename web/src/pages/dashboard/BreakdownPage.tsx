import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../store";
import { Button } from "../../components/ui/button";
import { AnalyticsBreakdown } from "../../components/dashboard/AnalyticsBreakdown";
import { TopPages } from "../../components/dashboard/TopPages";
import { TopCountries } from "../../components/dashboard/TopCountries";
import { OnlineUsers } from "../../components/dashboard/OnlineUsers";
import { queryKeys, useProject } from "../../hooks/useApi";
import { PLine } from "@/components/Line";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function BreakdownPage() {
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
        <div className="w-full max-w-md border border-border/60 bg-muted/10 p-10 text-center">
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
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.deviceAnalytics(activeProject.id),
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.trafficSources(activeProject.id),
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.topPages(activeProject.id),
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.countryData(activeProject.id),
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.onlineUsers(activeProject.id),
    });
    setRefreshing(false);
  };

  return (
    <section className="max-w-7xl mx-auto relative">
      <PLine />
      <div className="px-4 md:px-6 py-5 border-b border-border/60 relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl text-foreground">
              Breakdown
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Traffic breakdown and performance insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OnlineUsers projectId={activeProject.id} />
            <Button
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8 gap-2 px-3 text-xs border border-border/60"
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

      <div>
        <AnalyticsBreakdown projectId={activeProject.id} />
      </div>

      <div className="grid lg:grid-cols-2 border-b border-border/60">
        <div className="border-r border-border/60">
          <TopCountries projectId={activeProject.id} />
        </div>

        <TopPages projectId={activeProject.id} />
      </div>
    </section>
  );
}
