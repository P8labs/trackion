import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { analyticsHooks } from "@/hooks/queries/use-analytics";
import { BaseHeader } from "@/components/core/project/analytics/base-header";
import { analyticsQueryKeys } from "@trackion/lib/queries";

export function RealtimePage() {
  const { id: projectId = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: events,
    isLoading,
    error,
  } = analyticsHooks.useRealtimeEvents(projectId);

  return (
    <section className="max-w-7xl mx-auto relative">
      <div className="px-4 md:px-6 py-6 border-b border-border/60 relative">
        <BaseHeader
          label="Realtime Events"
          description="Live event log, auto-updated every 5 seconds"
          projectId={projectId}
          refreshKeys={[
            [analyticsQueryKeys.realtimeEvents(projectId, 10)],
            [analyticsQueryKeys.onlineUsers(projectId)],
          ]}
        />

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
        </div>
      </div>
      <div className="border-y border-border/60">
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
                return (
                  <div
                    key={event.id}
                    onClick={() =>
                      navigate(
                        `/projects/${projectId}/events?focusEventId=${event.id}`,
                      )
                    }
                    className="px-4 md:px-6 py-2.5 flex items-start gap-3 cursor-pointer border-b border-border/50 hover:bg-muted/15 transition"
                  >
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs text-primary truncate">
                          {event.event_name}
                        </span>

                        <span className="text-muted-foreground truncate text-xs">
                          {event.device} {event.platform}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                        <span className="font-mono">#{event.id}</span>

                        {event.page_path && (
                          <span className="truncate">{event.page_path}</span>
                        )}
                      </div>
                    </div>

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
