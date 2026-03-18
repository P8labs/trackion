import { useState } from "react";
import { useChartData } from "../../hooks/useApi";
import { LoadingSpinner } from "../LoadingSpinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface EventsChartProps {
  projectId: string;
}

const timeRangeOptions = [
  { value: "today", label: "Today" },
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

export function EventsChart({ projectId }: EventsChartProps) {
  const [timeRange, setTimeRange] = useState("today");
  const [eventFilter, setEventFilter] = useState("");

  const { data, isLoading, error } = useChartData(
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "hsl(var(--border))",
                      strokeDasharray: "4 4",
                    }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      color: "hsl(var(--foreground))",
                      padding: "8px 12px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </section>
  );
}
