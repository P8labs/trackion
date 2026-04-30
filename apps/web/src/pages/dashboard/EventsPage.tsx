import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../store";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EventDetailsModal } from "../../components/events/EventDetailsModal";
import { AdvancedEventFilter } from "../../components/events/AdvancedEventFilter";
import { OnlineUsersChip } from "../../components/core/project/analytics/online-users-chip";
import {
  queryKeys,
  useProject,
  useRecentEventsPaginated,
} from "../../hooks/useApi";
import { PLine } from "@/components/Line";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  RefreshIcon,
  Search02Icon,
  Activity01Icon,
  Clock02Icon,
  MousePointerClick,
  TimerIcon,
  ChevronLeft,
  ChevronRight,
} from "@hugeicons/core-free-icons";
import moment from "moment";
import type { RecentEventData } from "../../types";

export function EventsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentProject } = useStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: projectFromRoute } = useProject(id || "");
  const activeProject = id
    ? projectFromRoute || (currentProject?.id === id ? currentProject : null)
    : currentProject;

  const [search, setSearch] = useState("");
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([
    "all",
  ]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [sessionFilter, setSessionFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<RecentEventData | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [highlightedEventId, setHighlightedEventId] = useState<number | null>(
    null,
  );
  const eventRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const pageSize = 20;

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useRecentEventsPaginated(activeProject?.id || "", page, pageSize);

  // Parse properties helper
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

  const getEventColor = (eventName: string) => {
    switch (eventName) {
      case "page.view":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
      case "page.click":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30";
      case "page.time_spent":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30";
      default:
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30";
    }
  };

  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case "page.click":
        return MousePointerClick;
      case "page.time_spent":
        return TimerIcon;
      default:
        return Activity01Icon;
    }
  };

  const eventGroups = useMemo(() => {
    const groups = new Map<string, number>();
    for (const event of paginatedData?.events || []) {
      groups.set(event.event_name, (groups.get(event.event_name) || 0) + 1);
    }
    return [
      { key: "all", label: "All Events", count: paginatedData?.total || 0 },
      ...Array.from(groups.entries())
        .map(([key, count]) => ({ key, label: key, count }))
        .sort((a, b) => b.count - a.count),
    ];
  }, [paginatedData?.events, paginatedData?.total]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const fromTime = dateRange.from ? new Date(dateRange.from).getTime() : 0;
    const toTime = dateRange.to ? new Date(dateRange.to).getTime() : Infinity;

    return (paginatedData?.events || []).filter((event) => {
      if (
        selectedEventTypes[0] !== "all" &&
        !selectedEventTypes.includes(event.event_name)
      ) {
        return false;
      }

      const eventTime = new Date(event.created_at).getTime();
      if (eventTime < fromTime || eventTime > toTime) {
        return false;
      }

      if (sessionFilter && !event.session_id.includes(sessionFilter)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const parsed = parseProperties(event.properties);
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
  }, [
    paginatedData?.events,
    selectedEventTypes,
    dateRange,
    sessionFilter,
    search,
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.recentEventsPaginated(
        activeProject?.id || "",
        page,
        pageSize,
      ),
      exact: false,
    });
    setRefreshing(false);
  };

  const handleReset = () => {
    setSelectedEventTypes(["all"]);
    setDateRange({ from: "", to: "" });
    setSessionFilter("");
    setSearch("");
  };

  useEffect(() => {
    const focusEventIdParam = searchParams.get("focusEventId");
    if (!focusEventIdParam) {
      return;
    }

    const focusEventId = Number(focusEventIdParam);
    if (!Number.isFinite(focusEventId) || focusEventId <= 0) {
      return;
    }

    const targetExists = filteredEvents.some(
      (event) => event.id === focusEventId,
    );
    if (!targetExists) {
      return;
    }

    setHighlightedEventId(focusEventId);
    eventRefs.current[focusEventId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    const timeout = setTimeout(() => {
      setHighlightedEventId(null);
    }, 2500);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("focusEventId");
    setSearchParams(nextParams, { replace: true });

    return () => clearTimeout(timeout);
  }, [filteredEvents, searchParams, setSearchParams]);

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Card className="p-12 text-center max-w-md border-border/60">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Select a project to continue
            </h2>
            <p className="text-muted-foreground mb-6">
              Open the project list and choose a project to view events and
              activity.
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

  return (
    <section className="max-w-7xl mx-auto relative">
      <PLine />

      <div className="px-4 md:px-6 py-6 border-b border-border/60 relative">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl text-foreground">
                Events
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                View and analyze tracked events in real-time
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
              <div className="text-xs font-medium text-muted-foreground">
                Total Events
              </div>
              <div className="text-lg font-semibold text-foreground">
                {paginatedData?.total || 0}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
              <div className="text-xs font-medium text-muted-foreground">
                Showing
              </div>
              <div className="text-lg font-semibold text-foreground">
                {filteredEvents.length}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
              <div className="text-xs font-medium text-muted-foreground">
                Event Types
              </div>
              <div className="text-lg font-semibold text-foreground">
                {eventGroups.length - 1}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
              <div className="text-xs font-medium text-muted-foreground">
                Page
              </div>
              <div className="text-lg font-semibold text-foreground">
                {page} / {paginatedData?.total_pages || 1}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 space-y-4">
        <div className="relative">
          <HugeiconsIcon
            icon={Search02Icon}
            className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, pages, sessions..."
            className="pl-10 h-10 border-border/60 bg-muted/15"
          />
        </div>

        <AdvancedEventFilter
          eventTypes={eventGroups}
          selectedEventTypes={selectedEventTypes}
          onEventTypeChange={setSelectedEventTypes}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          sessionFilter={sessionFilter}
          onSessionFilterChange={setSessionFilter}
          onReset={handleReset}
        />

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : error ? (
            <div className="flex h-96 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5">
              <div className="text-sm text-destructive">
                Failed to load events. Please try again.
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/15">
              <div className="text-center">
                <HugeiconsIcon
                  icon={Activity01Icon}
                  className="h-8 w-8 mx-auto text-muted-foreground mb-3"
                />
                <p className="text-sm font-medium text-foreground mb-1">
                  No events found
                </p>
                <p className="text-xs text-muted-foreground">
                  {search || dateRange.from || sessionFilter
                    ? "Try adjusting your filters"
                    : "Events will appear here as they are tracked"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  ref={(el) => {
                    eventRefs.current[event.id] = el;
                  }}
                  onClick={() => {
                    setSelectedEvent(event);
                    setDetailsOpen(true);
                  }}
                  className={`group cursor-pointer rounded-lg border bg-muted/15 p-4 transition-all hover:bg-muted/25 hover:border-border/80 hover:shadow-sm ${
                    highlightedEventId === event.id
                      ? "border-sky-500/60 ring-1 ring-sky-500/40"
                      : "border-border/60"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge
                          className={`shrink-0 gap-1.5 ${getEventColor(event.event_name)}`}
                        >
                          <HugeiconsIcon
                            icon={getEventIcon(event.event_name)}
                            className="h-3 w-3"
                          />
                          <span className="font-mono text-xs">
                            {event.event_name}
                          </span>
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm text-foreground truncate">
                            {event.page_path || "/"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs shrink-0">
                        <HugeiconsIcon
                          icon={Clock02Icon}
                          className="h-3.5 w-3.5"
                        />
                        <span>{moment(event.created_at).fromNow()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {event.referrer && event.referrer !== "Direct" && (
                        <span className="px-2 py-1 rounded bg-background/50 border border-border/40 text-muted-foreground">
                          {event.referrer}
                        </span>
                      )}

                      {event.session_id && (
                        <span className="px-2 py-1 rounded bg-background/50 border border-border/40 text-muted-foreground font-mono">
                          {event.session_id.slice(0, 12)}...
                        </span>
                      )}

                      {event.utm_source && (
                        <span className="px-2 py-1 rounded bg-background/50 border border-border/40 text-muted-foreground">
                          utm: {event.utm_source}
                        </span>
                      )}

                      {Object.keys(parseProperties(event.properties)).length >
                        0 && (
                        <span className="px-2 py-1 rounded bg-background/50 border border-border/40 text-muted-foreground">
                          + properties
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredEvents.length > 0 && (
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
              className="h-9 gap-2 border-border/60"
            >
              <HugeiconsIcon icon={ChevronLeft} className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="px-3 py-1 rounded border border-border/60 bg-muted/15">
                Page {page} of {paginatedData?.total_pages || 1}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page >= (paginatedData?.total_pages || 1) || isLoading}
              className="h-9 gap-2 border-border/60"
            >
              Next
              <HugeiconsIcon icon={ChevronRight} className="h-4 w-4" />
            </Button>
          </div>
        )}

        <EventDetailsModal
          event={selectedEvent}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      </div>
    </section>
  );
}
