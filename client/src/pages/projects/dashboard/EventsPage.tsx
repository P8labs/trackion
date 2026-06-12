import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { EventDetailsModal } from "@/components/core/project/modals/event-detail-modal";
import { AdvancedEventFilter } from "@/components/core/project/events/events-filter";

import moment from "moment";
import { LoadingBanner } from "@/components/core/loading-banner";
import { analyticsHooks } from "@/hooks/queries/use-analytics";
import type { RecentEventData } from "@/types";
import { ErrorBanner } from "@/components/core/error-banner";

import { Search, Activity, Clock3 } from "lucide-react";

import {
  Badge,
  Group,
  Paper,
  Pagination,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { cn } from "@/lib/utils";

export function EventsPage() {
  const { id: projectId = "" } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([
    "all",
  ]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [sessionFilter, setSessionFilter] = useState("");
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
  } = analyticsHooks.useRecentEvents(projectId, page, pageSize);

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

  if (isLoading && page === 1) {
    return <LoadingBanner />;
  }

  return (
    <section className="max-w-7xl mx-auto relative">
      <SimpleGrid cols={{ base: 2, md: 4 }} className="px-4 md:px-6 py-4">
        <Stat label="Total Events" value={paginatedData?.total || 0} />
        <Stat
          label="Unique Event Types"
          value={eventGroups.length - 1} // exclude "all"
        />
        <Stat
          label="Most Common Event"
          value={
            eventGroups.length > 1
              ? `${eventGroups[1].label} (${eventGroups[1].count})`
              : "N/A"
          }
        />
        <Stat
          label="Time Range"
          value={
            paginatedData?.events.length
              ? `${moment(paginatedData.events[0].created_at).fromNow()} - ${moment(
                  paginatedData.events[paginatedData.events.length - 1]
                    .created_at,
                ).fromNow(false)}`
              : "N/A"
          }
        />
      </SimpleGrid>

      <div className="px-4 md:px-6 py-6 space-y-4">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search events, pages, sessions..."
          leftSection={<Search size={16} />}
        />

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
        <div className={"first:rounded-t-none! last:rounded-b-none!"}>
          {isLoading ? (
            <LoadingBanner />
          ) : error ? (
            <ErrorBanner error={error} />
          ) : filteredEvents.length === 0 ? (
            <Stack align="center" py="xl">
              <Activity size={32} className="opacity-50" />
              <div className="text-center">
                <Text fw={500}>No events found</Text>
                <Text size="sm" c="dimmed">
                  {search || dateRange.from || sessionFilter
                    ? "Try adjusting your filters"
                    : "Events will appear here as they are tracked"}
                </Text>
              </div>
            </Stack>
          ) : (
            filteredEvents.map((event, i) => (
              <Paper
                key={event.id}
                withBorder
                ref={(el) => {
                  eventRefs.current[event.id] = el;
                }}
                onClick={() => {
                  setSelectedEvent(event);
                  setDetailsOpen(true);
                }}
                className={cn(
                  "cursor-pointer px-5 md:px-6 py-4 transition-colors rounded-none! hover:bg-(--mantine-color-gray-1)! dark:hover:bg-(--mantine-color-dark-4)!",
                  i === 0 && "rounded-t-lg!",
                  i === filteredEvents.length - 1 && "rounded-b-lg!",
                  highlightedEventId === event.id &&
                    "bg-(--mantine-color-gray-1)! dark:bg-(--mantine-color-dark-4)! border-2! border-(--mantine-color-blue-3)!",
                )}
              >
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start">
                    <Group gap="sm" wrap="nowrap">
                      <Badge
                        variant="dot"
                        color={getEventColor(event.event_name)}
                      >
                        {event.event_name}
                      </Badge>

                      <Text ff="monospace" size="sm" truncate>
                        {event.page_path || "/"}
                      </Text>
                    </Group>

                    <Group gap={4}>
                      <Clock3 size={12} />

                      <Text size="xs" c="dimmed">
                        {moment(event.created_at).fromNow()}
                      </Text>
                    </Group>
                  </Group>

                  <Group gap="xs">
                    {event.referrer && event.referrer !== "Direct" && (
                      <Badge variant="dot" size="sm">
                        {event.referrer}
                      </Badge>
                    )}

                    {event.session_id && (
                      <Badge variant="default" size="sm">
                        {event.session_id.slice(0, 12)}...
                      </Badge>
                    )}

                    {event.utm_source && (
                      <Badge variant="default" size="sm">
                        utm: {event.utm_source}
                      </Badge>
                    )}

                    {Object.keys(parseProperties(event.properties)).length >
                      0 && (
                      <Badge variant="default" size="sm">
                        Properties
                      </Badge>
                    )}
                  </Group>
                </Stack>
              </Paper>
            ))
          )}
        </div>

        {filteredEvents.length > 0 && (paginatedData?.total_pages || 1) > 1 && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {paginatedData?.total?.toLocaleString()} events
            </Text>

            <Pagination
              value={page}
              onChange={setPage}
              total={paginatedData?.total_pages || 1}
              disabled={isLoading}
              size="sm"
            />
          </Group>
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

function getEventColor(eventName: string) {
  switch (eventName) {
    case "page.view":
      return "green";

    case "page.click":
      return "red";

    case "page.time_spent":
      return "yellow";

    default:
      return "blue";
  }
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>

      <Text fw={600}>{value}</Text>
    </Stack>
  );
}
