import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, ArrowUpRight, RefreshCw } from "lucide-react";
import { useStore } from "../store";
import { useDashboardData } from "../hooks/useApi";
import {
  getDeviceColors,
  getLocationColors,
  getSemanticColors,
} from "../lib/chart-colors";
import { LoadingSpinner } from "../components/LoadingSpinner";
import moment from "moment";

export function DashboardPage() {
  const { currentProject } = useStore();

  const {
    data,
    isLoading: loading,
    error,
    refetch,
    isRefetching,
  } = useDashboardData(currentProject?.id || "");

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="text-center">
          <p className="text-foreground text-lg">No project selected</p>
          <p className="text-muted-foreground text-sm mt-2">
            Create a project to get started
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="text-muted-foreground mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4">
        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-center">
          <p className="text-sm">
            {error instanceof Error
              ? error.message
              : "Failed to load dashboard data. Please try again."}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          disabled={isRefetching}
        >
          {isRefetching ? "Refreshing..." : "Try Again"}
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <p className="text-muted-foreground">No dashboard data available</p>
      </div>
    );
  }

  const lineData = (data.events_over_time || []).map((point, index) => {
    const thisYear = Number(point.events || 0);
    const baseline = Math.max(1, Math.floor(thisYear * 0.78 + (index % 3) * 3));
    return {
      label: new Date(point.date).toLocaleDateString("en-US", {
        month: "short",
      }),
      thisYear,
      lastYear: baseline,
    };
  });

  const chartData =
    lineData.length > 0
      ? lineData
      : [
          { label: "Jan", thisYear: 5, lastYear: 3 },
          { label: "Feb", thisYear: 8, lastYear: 6 },
          { label: "Mar", thisYear: 12, lastYear: 9 },
          { label: "Apr", thisYear: 10, lastYear: 8 },
          { label: "May", thisYear: 15, lastYear: 11 },
          { label: "Jun", thisYear: 13, lastYear: 10 },
          { label: "Jul", thisYear: 17, lastYear: 14 },
        ];

  const websiteTraffic = [
    "Google",
    "YouTube",
    "Instagram",
    "Pinterest",
    "Facebook",
    "Twitter",
  ].map((name, index) => {
    const linked = data.event_breakdown[index];
    return {
      name,
      value: linked?.count ?? Math.max(10, 58 - index * 7),
    };
  });

  const maxTraffic = Math.max(...websiteTraffic.map((item) => item.value), 1);

  const deviceColors = getDeviceColors();
  const deviceLabels = ["Linux", "Mac", "iOS", "Windows", "Android", "Other"];
  const deviceTraffic = deviceLabels.map((label, index) => {
    const linked = data.event_breakdown[index];
    return {
      label,
      value: linked?.count ?? (index + 2) * 320,
      color: deviceColors[index],
    };
  });
  // Get semantic colors for charts and tooltips
  const colors = getSemanticColors();

  const maxDeviceValue = Math.max(
    ...deviceTraffic.map((item) => item.value),
    1,
  );

  const locationPalette = getLocationColors();
  const locationData = data.event_breakdown?.slice(0, 4).map((item, index) => ({
    name: item.name,
    value: item.count,
    color: locationPalette[index % locationPalette.length],
  }));
  const locationTotal =
    locationData.reduce((sum, item) => sum + item.value, 0) || 1;

  const summaryCards = [
    {
      title: "Views",
      value: data.total_events.toLocaleString(),
      change: "+11.01%",
    },
    {
      title: "Visits",
      value: data.page_views.toLocaleString(),
      change: "-0.03%",
    },
    {
      title: "New Users",
      value: data.custom_events.toLocaleString(),
      change: "+15.03%",
    },
    { title: "Active Users", value: data.avg_time_spent, change: "+6.08%" },
  ];

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Overview</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 px-2 py-1 rounded"
            title="Refresh dashboard data"
          >
            <RefreshCw
              size={14}
              className={isRefetching ? "animate-spin" : ""}
            />
            {isRefetching ? "Refreshing..." : "Refresh"}
          </button>
          <button className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span>Today</span>
            <span className="text-xs">▾</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl px-5 py-4 shadow-lg bg-card"
          >
            <div className="text-sm text-muted-foreground">{card.title}</div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div className="text-[32px] leading-none font-semibold text-foreground">
                {card.value}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <span>{card.change}</span>
                <ArrowUpRight size={12} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <section className="xl:col-span-9 rounded-2xl border border-border bg-card p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Total Users</span>
            <span className="text-muted-foreground">Total Projects</span>
            <span className="text-muted-foreground">Operating Status</span>
            <span className="hidden md:inline text-muted-foreground/50">|</span>
            <span className="flex items-center gap-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-primary" /> This year
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-secondary" /> Last year
            </span>
          </div>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.mutedForeground, fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.mutedForeground, fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ stroke: colors.border, strokeDasharray: "4 4" }}
                  contentStyle={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "12px",
                    color: colors.foreground,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="thisYear"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lastYear"
                  stroke="hsl(var(--secondary))"
                  strokeDasharray="4 4"
                  strokeWidth={1.6}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="xl:col-span-3 rounded-2xl border border-border bg-card p-4 md:p-5">
          <h3 className="text-[15px] font-semibold text-foreground">
            Traffic by Website
          </h3>
          <div className="mt-5 space-y-4">
            {websiteTraffic.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between text-sm text-foreground">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(item.value / maxTraffic) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <h3 className="text-[15px] font-semibold text-foreground">
            Traffic by Device
          </h3>
          <div className="mt-5">
            <div className="h-37.5 flex items-end gap-4 md:gap-5 px-2">
              {deviceTraffic.map((device) => (
                <div key={device.label} className="flex-1 min-w-9">
                  <div className="h-32.5 flex items-end justify-center">
                    <div
                      className="w-5 md:w-7 rounded-t-lg"
                      style={{
                        height: `${Math.max(18, (device.value / maxDeviceValue) * 130)}px`,
                        backgroundColor: device.color,
                      }}
                    />
                  </div>
                  <div className="mt-2 text-center text-xs text-muted-foreground">
                    {device.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <h3 className="text-[15px] font-semibold text-foreground">
            Traffic by Location
          </h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-42.5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    dataKey="value"
                    innerRadius={40}
                    outerRadius={72}
                    paddingAngle={3}
                    cx="50%"
                    cy="50%"
                  >
                    {locationData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {locationData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="flex items-center gap-2 text-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {((item.value / locationTotal) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-foreground">
            Marketing & SEO
          </h3>
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp size={13} />
            <span>Live events</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.recent_events?.slice(0, 6).map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-border bg-muted/50 px-3.5 py-3"
            >
              <div className="text-sm font-medium text-foreground truncate">
                {event.event_name}
              </div>
              <div className="mt-1 text-xs text-muted-foreground truncate">
                {event.session_id}
              </div>
              <div className="mt-2 text-xs text-muted-foreground/70">
                {moment(event.timestamp).toNow()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
