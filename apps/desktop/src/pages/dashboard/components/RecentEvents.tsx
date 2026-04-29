import { useMemo, useState } from "react";
import {
  TrendingUp,
  Clock,
  Activity,
  MousePointerClick,
  Search,
  Timer,
} from "lucide-react";
import moment from "moment";
import { useRecentEventsFormatted } from "@/hooks/useApi";
import { RecentEventData } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";

interface RecentEventsProps {
  projectId: string;
}

export function RecentEvents({ projectId }: RecentEventsProps) {
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");

  const {
    data: events,
    isLoading,
    error,
  } = useRecentEventsFormatted(projectId, 60);

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

  const parseProperties = (properties: unknown): Record<string, unknown> => {
    if (!properties) return {};

    try {
      const parsed =
        typeof properties === "string" ? JSON.parse(properties) : properties;
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }

    return {};
  };

  const formatEventProperties = (properties: unknown): string => {
    const parsed = parseProperties(properties);

    if (typeof parsed.duration_ms === "number") {
      const seconds = Math.round(parsed.duration_ms / 1000);
      return `${seconds}s`;
    }

    if (typeof parsed.element === "string" && parsed.element.trim() !== "") {
      return `Element: ${parsed.element}`;
    }

    const entries = Object.entries(parsed);
    if (entries.length > 0) {
      const [key, value] = entries[0];
      const rendered = String(value);
      return `${key}: ${rendered.slice(0, 20)}${rendered.length > 20 ? "..." : ""}`;
    }

    return "";
  };

  const getPropertyPreview = (event: RecentEventData) => {
    const parsed = parseProperties(event.properties);
    return Object.entries(parsed)
      .filter(([, value]) => {
        const t = typeof value;
        return t === "string" || t === "number" || t === "boolean";
      })
      .slice(0, 3)
      .map(([key, value]) => `${key}: ${String(value)}`);
  };

  const eventGroups = useMemo(() => {
    const groups = new Map<string, number>();

    for (const event of events || []) {
      groups.set(event.event_name, (groups.get(event.event_name) || 0) + 1);
    }

    return [
      { key: "all", label: "All", count: events?.length || 0 },
      ...Array.from(groups.entries())
        .map(([key, count]) => ({ key, label: key, count }))
        .sort((a, b) => b.count - a.count),
    ];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const [propertyKey, propertyValue] = query.includes(":")
      ? query.split(":", 2)
      : ["", ""];

    return (events || []).filter((event) => {
      if (activeGroup !== "all" && event.event_name !== activeGroup) {
        return false;
      }

      if (!query) {
        return true;
      }

      const parsed = parseProperties(event.properties);

      if (propertyKey) {
        for (const [key, value] of Object.entries(parsed)) {
          const normalizedKey = key.toLowerCase();
          const normalizedValue = String(value).toLowerCase();
          if (
            normalizedKey.includes(propertyKey) &&
            normalizedValue.includes(propertyValue)
          ) {
            return true;
          }
        }
      }

      const searchable = [
        event.event_name,
        event.page_path || "",
        event.referrer || "",
        event.session_id || "",
        JSON.stringify(parsed),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [activeGroup, events, search]);

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
              {filteredEvents.length}
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events or property:value"
            className="h-9 pl-8 text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {eventGroups.map((group) => (
            <Button
              key={group.key}
              type="button"
              size="sm"
              variant={activeGroup === group.key ? "default" : "outline"}
              className="h-7 cursor-pointer rounded-full px-2.5 text-[11px]"
              onClick={() => setActiveGroup(group.key)}
            >
              {group.label}
              <span className="ml-1 text-[10px] opacity-80">{group.count}</span>
            </Button>
          ))}
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
            {filteredEvents.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/30">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    No events match current filters
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto pr-1">
                <div className="grid gap-2 sm:gap-2.5">
                  {filteredEvents.map((event) => (
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

                            {getPropertyPreview(event).map((propertyTag) => (
                              <span
                                key={`${event.id}-${propertyTag}`}
                                className="rounded-md border border-border/70 bg-background/80 px-2 py-0.5 text-muted-foreground"
                              >
                                {propertyTag}
                              </span>
                            ))}

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

                        {Object.keys(parseProperties(event.properties)).length >
                          0 && (
                          <details className="rounded-md border border-border/70 bg-background/50 p-2">
                            <summary className="cursor-pointer text-[11px] font-medium text-muted-foreground">
                              View full properties
                            </summary>
                            <pre className="mt-2 overflow-x-auto rounded bg-muted/50 p-2 text-[10px] text-muted-foreground">
                              {JSON.stringify(
                                parseProperties(event.properties),
                                null,
                                2,
                              )}
                            </pre>
                          </details>
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
