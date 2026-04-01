import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../store";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { DashboardCounts } from "../../components/dashboard/DashboardCounts";
import { RecentEvents } from "../../components/dashboard/RecentEvents";
import { OnlineUsers } from "../../components/dashboard/OnlineUsers";
import { queryKeys, useProject } from "../../hooks/useApi";

export function EventsPage() {
  const { id } = useParams<{ id: string }>();
  const { currentProject, setCurrentProject } = useStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.counts(activeProject.id),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.recentEventsFormatted(activeProject.id),
      exact: false,
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.onlineUsers(activeProject.id),
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
            Event stream and latest activity
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

      <DashboardCounts projectId={activeProject.id} />
      <RecentEvents projectId={activeProject.id} />
    </div>
  );
}
