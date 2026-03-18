import { useState } from "react";
import { useAreaChartData } from "../../hooks/useApi";
import { LoadingSpinner } from "../LoadingSpinner";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../ui/chart";

interface EventsChartProps {
  projectId: string;
}

const timeRangeOptions = [
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
];

const eventFilters = [
  { value: "", label: "All Events" },
  { value: "pageview", label: "Page Views" },
  { value: "click", label: "Clicks" },
  { value: "time_spent", label: "Time Spent" },
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

export function EventsChart({ projectId }: EventsChartProps) {
  const [timeRange, setTimeRange] = useState("7d");
  const [eventFilter, setEventFilter] = useState("");

  const { data, isLoading, error } = useAreaChartData(
    projectId,
    timeRange,
    eventFilter,
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h3 className="text-[15px] font-semibold text-foreground">
          Events Over Time
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {eventFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          <div className="flex gap-1 p-1 rounded-lg bg-muted">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  timeRange === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      )}

      {error && (
        <div className="h-64 flex items-center justify-center">
          <div className="text-sm text-destructive">
            Failed to load chart data
          </div>
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          {data.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  No data available for this time range
                </p>
              </div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="min-h-64 w-full">
              <AreaChart accessibilityLayer data={data}>
                <defs>
                  <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-desktop)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-desktop)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-mobile)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-mobile)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="mobile"
                  type="natural"
                  fill="url(#fillMobile)"
                  stroke="var(--color-mobile)"
                  stackId="a"
                />
                <Area
                  dataKey="desktop"
                  type="natural"
                  fill="url(#fillDesktop)"
                  stroke="var(--color-desktop)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          )}
        </>
      )}
    </section>
  );
}
