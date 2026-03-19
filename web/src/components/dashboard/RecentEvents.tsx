import { useRecentEventsFormatted } from "../../hooks/useApi";
import { LoadingSpinner } from "../LoadingSpinner";
import {
  TrendingUp,
  Clock,
  Activity,
  MousePointerClick,
  Timer,
} from "lucide-react";
import moment from "moment";
import { Badge } from "../ui/badge";

interface RecentEventsProps {
  projectId: string;
}

export function RecentEvents({ projectId }: RecentEventsProps) {
  const {
    data: events,
    isLoading,
    error,
  } = useRecentEventsFormatted(projectId, 20);

  const getEventColor = (eventName: string) => {
    switch (eventName) {
      case "page.view":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "page.click":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "page.time_spent":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      default:
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400";
    }
  };

  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case "page.click":
        return <MousePointerClick className="h-3.5 w-3.5" />;
      case "page.time_spent":
        return <Timer className="h-3.5 w-3.5" />;
      default:
        return <Activity className="h-3.5 w-3.5" />;
    }
  };

  const formatEventProperties = (properties: any): string => {
    if (!properties) return "";

    try {
      const parsed =
        typeof properties === "string" ? JSON.parse(properties) : properties;

      if (parsed.duration_ms) {
        const seconds = Math.round(parsed.duration_ms / 1000);
        return `${seconds}s`;
      }

      if (parsed.element) {
        return `Element: ${parsed.element}`;
      }

      const entries = Object.entries(parsed);
      if (entries.length > 0) {
        const [key, value] = entries[0];
        return `${key}: ${String(value).slice(0, 20)}${String(value).length > 20 ? "..." : ""}`;
      }
    } catch {
      return "";
    }

    return "";
  };

  const formatPath = (path?: string) => {
    if (!path) return "/";
    if (path.length <= 44) return path;
    return `${path.slice(0, 44)}...`;
  };

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
          <Activity className="h-4 w-4 text-sky-500" />
          Recent Events
        </h3>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
          <TrendingUp size={13} className="text-emerald-500" />
          <span>Live feed</span>
          {!isLoading && !error && events && (
            <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
              {events.length}
            </span>
          )}
        </div>
      </div>

      <div className="h-88 sm:h-96">
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5">
            <div className="text-sm text-destructive">
              Failed to load recent events
            </div>
          </div>
        )}

        {!isLoading && !error && events && (
          <>
            {events.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/30">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    No recent events
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto pr-1">
                <div className="grid gap-2 sm:gap-2.5">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="group rounded-xl border border-border/80 bg-background/30 p-3 transition-all hover:border-border hover:bg-muted/40 sm:p-3.5"
                    >
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Badge
                            variant="secondary"
                            className={`inline-flex items-center gap-1.5 ${getEventColor(event.event_name)}`}
                          >
                            {getEventIcon(event.event_name)}
                            {event.event_name}
                          </Badge>

                          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{moment(event.created_at).fromNow()}</span>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground sm:text-[13.5px]">
                            {formatPath(event.page_path)}
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                            {formatEventProperties(event.properties) && (
                              <span className="rounded-md bg-muted/70 px-2 py-0.5 text-muted-foreground">
                                {formatEventProperties(event.properties)}
                              </span>
                            )}

                            {event.referrer && event.referrer !== "Direct" && (
                              <span className="rounded-md bg-muted/70 px-2 py-0.5 text-muted-foreground">
                                from {event.referrer}
                              </span>
                            )}

                            {event.session_id && (
                              <span className="hidden rounded-md bg-muted/70 px-2 py-0.5 text-muted-foreground sm:inline">
                                session {event.session_id.slice(0, 8)}
                              </span>
                            )}
                          </div>
                        </div>

                        {event.utm_source && (
                          <div className="text-[11px] text-muted-foreground/90">
                            utm: {event.utm_source}
                            {event.utm_medium ? ` / ${event.utm_medium}` : ""}
                            {event.utm_campaign
                              ? ` / ${event.utm_campaign}`
                              : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
