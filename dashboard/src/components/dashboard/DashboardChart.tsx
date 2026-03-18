import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
import { LoadingSpinner } from "../LoadingSpinner";
import { useChartDataFlexible } from "../../hooks/useApi";

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
  { value: "", label: "All events" },
  { value: "pageview", label: "Page views" },
  { value: "time_spent", label: "Time spent" },
  { value: "click", label: "Click events" },
];

export function DashboardChart({ projectId }: ChartDataProps) {
  const [timeRange, setTimeRange] = useState("24h");
  const [eventFilter, setEventFilter] = useState("");

  const { data, isLoading, error } = useChartDataFlexible(
    projectId,
    timeRange,
    eventFilter,
  );

  const chartData =
    data?.map((point) => ({
      time: point.period,
      events: point.count,
    })) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
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
              <SelectTrigger className="w-[140px]">
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
            <Select
              value={eventFilter}
              onValueChange={(v) => setEventFilter(v || "")}
            >
              <SelectTrigger className="w-30">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-75 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="h-75 flex items-center justify-center text-muted-foreground">
            Failed to load chart data
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-75 flex items-center justify-center text-muted-foreground">
            No data available for the selected period
          </div>
        ) : (
          <div className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="time"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="events"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "hsl(var(--primary))",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
