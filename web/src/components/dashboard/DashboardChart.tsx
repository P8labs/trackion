import { useMemo, useState } from "react";
import { Calendar, Filter } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Events Over Time</CardTitle>
            <CardDescription>
              Real-time analytics for your project
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={timeRange}
              onValueChange={(v) => setTimeRange(v || "")}
            >
              <SelectTrigger className="h-8 w-34 text-xs">
                <Calendar className="h-4 w-4" />
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Group
          </span>
          {EVENT_FILTERS.map((filter) => {
            const selected = (eventFilter || "all") === filter.value;
            return (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={selected ? "default" : "outline"}
                className="h-7 cursor-pointer rounded-full px-2.5 text-[11px]"
                onClick={() =>
                  setEventFilter(filter.value === "all" ? "" : filter.value)
                }
              >
                {filter.label}
              </Button>
            );
          })}
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-md border border-border/70 bg-muted/40 px-2 py-1.5">
            <p className="text-muted-foreground">Total</p>
            <p className="font-semibold text-foreground">
              {chartSummary.total}
            </p>
          </div>
          <div className="rounded-md border border-border/70 bg-muted/40 px-2 py-1.5">
            <p className="text-muted-foreground">Peak</p>
            <p className="font-semibold text-foreground">{chartSummary.peak}</p>
          </div>
          <div className="rounded-md border border-border/70 bg-muted/40 px-2 py-1.5">
            <p className="text-muted-foreground">Latest</p>
            <p className="font-semibold text-foreground">
              {chartSummary.latest}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-75 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="h-75 flex items-center justify-center text-muted-foreground">
            Failed to load chart data
          </div>
        ) : !data ? (
          <div className="h-75 flex items-center justify-center text-muted-foreground">
            No data available for the selected period
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
                cursor={false}
                labelFormatter={(value) => {
                  const d = new Date(value);

                  if (timeRange === "30m" || timeRange === "1h") {
                    return d.toLocaleTimeString();
                  }

                  return d.toLocaleString();
                }}
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
      </CardContent>
    </Card>
  );
}
