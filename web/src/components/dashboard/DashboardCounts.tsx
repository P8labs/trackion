import { TrendingUp, Eye, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { LoadingSpinner } from "../LoadingSpinner";
import { useDashboardCounts } from "../../hooks/useApi";
import { formatTimeSpent } from "@/lib/utils";

interface DashboardCountsProps {
  projectId: string;
}

export function DashboardCounts({ projectId }: DashboardCountsProps) {
  const { data, isLoading, error } = useDashboardCounts(projectId);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <LoadingSpinner className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="h-6 w-20 bg-muted rounded animate-pulse mb-1"></div>
              <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Failed to load dashboard counts
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const counts = [
    {
      title: "Total Events",
      value: data?.total_events.toLocaleString() || "0",
      description: "All tracked events",
      icon: TrendingUp,
    },
    {
      title: "Views",
      value: data?.views.toLocaleString() || "0",
      description: "Page views",
      icon: Eye,
    },
    {
      title: "Unique Views",
      value: data?.unique_views.toLocaleString() || "0",
      description: "Unique visitors",
      icon: Users,
    },
    {
      title: "Avg. Time",
      value: formatTimeSpent(data?.avg_time_spent_seconds || 0),
      description: "Time spent on site",
      icon: Clock,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {counts.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
