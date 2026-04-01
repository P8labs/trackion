import { useMemo, useState } from "react";
import { Calendar01Icon, FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart";
import { LoadingSpinner } from "../LoadingSpinner";
import { useAreaChartData } from "../../hooks/useApi";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import PlusDecor from "../PlusDecor";

interface ChartDataProps {
  projectId: string;
}

const TIME_RANGES = [
  { value: "30m", label: "Last 30 minutes" },
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const EVENT_FILTERS = [
  { value: "all", label: "All events" },
  { value: "page.view", label: "Views" },
  { value: "page.time_spent", label: "Time" },
  { value: "page.click", label: "Clicks" },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function DashboardChart({ projectId }: ChartDataProps) {
  const [timeRange, setTimeRange] = useState("24h");
  const [eventFilter, setEventFilter] = useState("");

  const { data, isLoading, error } = useAreaChartData(
    projectId,
    timeRange,
    eventFilter,
  );

  const chartSummary = useMemo(() => {
    if (!data || data.length === 0) {
      return { total: 0, peak: 0, latest: 0 };
    }

    let total = 0;
    let peak = 0;

    for (const row of data) {
      const rowTotal = row.desktop + row.mobile;
      total += rowTotal;
      peak = Math.max(peak, rowTotal);
    }

    const latest = data[data.length - 1].desktop + data[data.length - 1].mobile;
    return { total, peak, latest };
  }, [data]);

  return (
    <section className="border-b border-border/60">
      <div className="px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Events</p>
          <p className="text-xs text-muted-foreground">
            Device distribution over time
          </p>
        </div>

        <Select value={timeRange} onValueChange={(v) => setTimeRange(v || "")}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="px-4 md:px-6 pb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 text-muted-foreground mr-1">
          <HugeiconsIcon icon={FilterIcon} className="h-3.5 w-3.5" />
          Group
        </span>

        {EVENT_FILTERS.map((filter) => {
          const selected = (eventFilter || "all") === filter.value;

          return (
            <button
              key={filter.value}
              onClick={() =>
                setEventFilter(filter.value === "all" ? "" : filter.value)
              }
              className={`
                px-2 py-1 rounded border text-[11px] transition
                ${
                  selected
                    ? "border-primary text-foreground bg-muted/30"
                    : "border-border/60 text-muted-foreground hover:bg-muted/20"
                }
              `}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="relative grid grid-cols-3 border-t border-border/60 text-xs">
        <Stat label="Total" value={chartSummary.total} />

        <Stat label="Peak" value={chartSummary.peak} />
        <Stat label="Latest" value={chartSummary.latest} />
      </div>

      <div className="px-4 md:px-6 py-6 relative">
        {isLoading ? (
          <div className="h-72 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="h-72 flex items-center justify-center text-muted-foreground">
            Failed to load chart
          </div>
        ) : !data ? (
          <div className="h-72 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <BarChart data={data} barGap={2} barCategoryGap="20%">
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const d = new Date(value);

                  if (timeRange === "30m" || timeRange === "1h") {
                    return d.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  }

                  if (timeRange === "24h") {
                    return d.toLocaleTimeString([], {
                      hour: "2-digit",
                    });
                  }

                  if (timeRange === "7d" || timeRange === "30d") {
                    return d.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    });
                  }

                  return d.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />

              <YAxis tickLine={false} axisLine={false} />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) => {
                      const d = new Date(value);

                      if (timeRange === "30m" || timeRange === "1h") {
                        return d.toLocaleTimeString();
                      }

                      return d.toLocaleString();
                    }}
                  />
                }
              />

              <Bar
                dataKey="mobile"
                fill="var(--color-mobile)"
                stackId="a"
                radius={[2, 2, 0, 0]}
              />

              <Bar
                dataKey="desktop"
                fill="var(--color-desktop)"
                stackId="a"
                radius={[2, 2, 0, 0]}
              />

              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        )}
        <PlusDecor />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-4 py-3 border-r border-b border-border/60 last:border-r-0 relative">
      <PlusDecor position="top" />
      <p className="text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-1">{value}</p>
      <PlusDecor />
    </div>
  );
}
