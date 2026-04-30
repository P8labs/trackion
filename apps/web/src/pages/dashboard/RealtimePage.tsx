import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../store";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { OnlineUsersChip } from "../../components/core/project/analytics/online-users-chip";
import {
  queryKeys,
  useProject,
  useRecentEventsFormatted,
} from "../../hooks/useApi";
import { PLine } from "@/components/Line";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import moment from "moment";

export function RealtimePage() {
  const { id } = useParams<{ id: string }>();
  const { currentProject } = useStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const { data: projectFromRoute } = useProject(id || "");

  const activeProject = id
    ? projectFromRoute || (currentProject?.id === id ? currentProject : null)
    : currentProject;

  const {
    data: events,
    isLoading,
    error,
  } = useRecentEventsFormatted(activeProject?.id || "", 20, 5 * 1000);

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
    setRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.recentEventsFormatted(activeProject.id),
      exact: false,
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.onlineUsers(activeProject.id),
    });
    setRefreshing(false);
  };

  return (
    <section className="max-w-7xl mx-auto relative">
      <PLine />

      <div className="px-4 md:px-6 py-6 border-b border-border/60 relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl text-foreground">
              Realtime Events
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Live event log, auto-updated every 5 seconds
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OnlineUsersChip projectId={activeProject.id} />
            <Button
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-9 gap-2 px-3 text-sm border border-border/60"
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
            <div className="text-xs font-medium text-muted-foreground">
              Stream Window
            </div>
            <div className="text-lg font-semibold text-foreground">Last 20</div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
            <div className="text-xs font-medium text-muted-foreground">
              Loaded Events
            </div>
            <div className="text-lg font-semibold text-foreground">
              {events?.length || 0}
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
            <div className="text-xs font-medium text-muted-foreground">
              Poll Interval
            </div>
            <div className="text-lg font-semibold text-foreground">5s</div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
            <div className="text-xs font-medium text-muted-foreground">
              Project
            </div>
            <div className="text-sm font-semibold text-foreground truncate">
              {activeProject.name}
            </div>
          </div>
        </div>
      </div>
      <div className="border-y border-border/60">
        {/* header */}
        <div className="px-4 md:px-6 py-3 flex items-center justify-between border-b border-border/60">
          <div>
            <p className="text-sm font-medium">Live Events</p>
            <p className="text-xs text-muted-foreground">
              Real-time stream across your project
            </p>
          </div>

          <span className="text-xs text-muted-foreground">
            {events?.length || 0} events
          </span>
        </div>

        <div className="max-h-[56vh] overflow-y-auto text-sm">
          {isLoading ? (
            <State>Loading events…</State>
          ) : error ? (
            <State error>Failed to load events</State>
          ) : !events?.length ? (
            <State>No events yet</State>
          ) : (
            <div>
              {events.map((event) => {
                const label =
                  event.event_name.split(".").pop() || event.event_name;

                return (
                  <div
                    key={event.id}
                    onClick={() =>
                      navigate(
                        `/projects/${activeProject.id}/events?focusEventId=${event.id}`,
                      )
                    }
                    className="
                      px-4 md:px-6 py-2.5
                      flex items-start gap-3
                      cursor-pointer
                      border-b border-border/50
                      hover:bg-muted/15
                      transition
                    "
                  >
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs text-primary truncate">
                          {event.event_name}
                        </span>

                        <span className="text-foreground truncate">
                          {label}
                        </span>
                      </div>

                      {/* meta */}
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                        <span className="font-mono">#{event.id}</span>

                        {event.page_path && (
                          <span className="truncate">{event.page_path}</span>
                        )}
                      </div>
                    </div>

                    {/* time */}
                    <div className="text-[11px] text-muted-foreground shrink-0">
                      {moment(event.created_at).fromNow()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function State({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`
        py-10 text-center text-sm
        ${error ? "text-destructive" : "text-muted-foreground"}
      `}
    >
      {children}
    </div>
  );
}
