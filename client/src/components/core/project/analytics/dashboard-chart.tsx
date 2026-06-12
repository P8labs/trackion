import { useMemo, useState } from "react";

import { Center, Group, Select, SimpleGrid, Stack, Text } from "@mantine/core";

import { ErrorBanner } from "@/components/core/error-banner";
import { LoadingBanner } from "@/components/core/loading-banner";
import { analyticsHooks } from "@/hooks/queries/use-analytics";
import { BarChart } from "@mantine/charts";
import moment from "moment";
import { CalendarIcon, FilterIcon } from "lucide-react";

interface ChartDataProps {
  projectId: string;
}

const TIME_RANGES = [
  { value: "30m", label: "30m" },
  { value: "1h", label: "1h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

const EVENT_FILTERS = [
  { value: "all", label: "All" },
  { value: "page.view", label: "Views" },
  { value: "page.time_spent", label: "Time" },
  { value: "page.click", label: "Clicks" },
];

export function DashboardChart({ projectId }: ChartDataProps) {
  const [timeRange, setTimeRange] = useState("24h");
  const [eventFilter, setEventFilter] = useState("");

  const { data, isLoading, error } = analyticsHooks.useChartData(
    projectId,
    timeRange,
    eventFilter,
  );

  const chartSummary = useMemo(() => {
    if (!data?.length) {
      return {
        total: 0,
        peak: 0,
        latest: 0,
      };
    }

    let total = 0;
    let peak = 0;

    for (const row of data) {
      const rowTotal = row.desktop + row.mobile;

      total += rowTotal;
      peak = Math.max(peak, rowTotal);
    }

    const latest = data[data.length - 1].desktop + data[data.length - 1].mobile;

    return {
      total,
      peak,
      latest,
    };
  }, [data]);

  return (
    <Stack gap={0}>
      <Group
        justify="space-between"
        align="flex-end"
        gap="md"
        className="px-5 md:px-6 py-5"
      >
        <div>
          <Text fw={600} size="sm">
            Events
          </Text>

          <Text size="sm" c="dimmed">
            Device distribution over time
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            size="xs"
            w={110}
            value={timeRange}
            onChange={(value) => setTimeRange(value || "24h")}
            data={TIME_RANGES}
            leftSection={<CalendarIcon size={14} />}
            allowDeselect={false}
          />
          <Select
            size="xs"
            w={110}
            value={eventFilter || "all"}
            onChange={(value) => setEventFilter(value || "all")}
            data={EVENT_FILTERS}
            leftSection={<FilterIcon size={14} />}
            allowDeselect={false}
          />
        </div>
      </Group>

      <div className="px-5 md:px-6 pb-5">
        <SimpleGrid cols={3}>
          <Metric label="Total" value={chartSummary.total.toLocaleString()} />
          <Metric label="Peak" value={chartSummary.peak.toLocaleString()} />
          <Metric label="Latest" value={chartSummary.latest.toLocaleString()} />
        </SimpleGrid>
      </div>

      <div className="px-5 md:px-6 pb-6">
        {isLoading ? (
          <Center h={260}>
            <LoadingBanner />
          </Center>
        ) : error ? (
          <ErrorBanner error={error} label="Failed to load chart data" />
        ) : !data?.length ? (
          <Center h={260}>
            <Text c="dimmed" size="sm">
              No data available
            </Text>
          </Center>
        ) : (
          <BarChart
            h={300}
            data={data}
            dataKey="period"
            series={[
              {
                name: "desktop",
                color: "violet.6",
                stackId: "traffic",
                label: "Desktop",
              },
              {
                name: "mobile",
                color: "blue.6",
                stackId: "traffic",
                label: "Mobile",
              },
            ]}
            xAxisProps={{
              tickFormatter: (value) => {
                const date = moment(value);

                if (timeRange === "30m" || timeRange === "1h") {
                  return date.format("h:mm A");
                }

                if (timeRange === "24h") {
                  return date.format("h A");
                }

                return date.format("MMM D");
              },
            }}
            tooltipProps={{
              labelFormatter: (value) => {
                const date = moment(value);

                if (timeRange === "30m" || timeRange === "1h") {
                  return date.format("h:mm A");
                }

                return date.format("MMM D, YYYY h:mm A");
              },
            }}
            tickLine="y"
          />
        )}
      </div>
    </Stack>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>

      <Text fw={600}>{value}</Text>
    </Stack>
  );
}
