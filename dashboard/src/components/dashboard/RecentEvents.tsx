import { useRecentEventsFormatted } from "../../hooks/useApi";
import { LoadingSpinner } from "../LoadingSpinner";
import { TrendingUp, Clock, Activity } from "lucide-react";
import { Badge } from "../ui/badge";
import moment from "moment";

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
      case "pageview":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "click":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "time_spent":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      default:
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
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

      // Show first property for other events
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

  return (
    <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Events
        </h3>
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp size={13} />
          <span>Live events</span>
        </div>
      </div>

      {isLoading && (
        <div className="h-40 flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      )}

      {error && (
        <div className="h-40 flex items-center justify-center">
          <div className="text-sm text-destructive">
            Failed to load recent events
          </div>
        </div>
      )}

      {!isLoading && !error && events && (
        <>
          {events.length === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  No recent events
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge
                      variant="secondary"
                      className={getEventColor(event.event_name)}
                    >
                      {event.event_name}
                    </Badge>

                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">
                        {event.page_path || "/"}
                      </div>
                      {formatEventProperties(event.properties) && (
                        <div className="text-xs text-muted-foreground">
                          {formatEventProperties(event.properties)}
                        </div>
                      )}
                    </div>

                    {event.referrer && event.referrer !== "Direct" && (
                      <div className="hidden sm:block text-xs text-muted-foreground">
                        from {event.referrer}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {moment(event.created_at).fromNow()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
