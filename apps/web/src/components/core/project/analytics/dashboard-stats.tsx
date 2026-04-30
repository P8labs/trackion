import {
  AnalyticsUpIcon,
  Clock01Icon,
  EyeIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { formatTimeSpent } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ErrorBanner } from "@/components/core/error-banner";
import { analyticsHooks } from "@/hooks/queries/use-analytics";

interface DashboardStatsProps {
  projectId: string;
}
export function DashboardStats({ projectId }: DashboardStatsProps) {
  const { data, isLoading, error } =
    analyticsHooks.useDashboardStats(projectId);

  const counts = [
    {
      title: "Events",
      value: data?.total_events.toLocaleString() || "0",
      icon: AnalyticsUpIcon,
    },
    {
      title: "Views",
      value: data?.views.toLocaleString() || "0",
      icon: EyeIcon,
    },
    {
      title: "Unique",
      value: data?.unique_views.toLocaleString() || "0",
      icon: UserGroupIcon,
    },
    {
      title: "Avg Time",
      value: formatTimeSpent(data?.avg_time_spent_seconds || 0),
      icon: Clock01Icon,
    },
  ];

  return (
    <div className="border-b border-border/60 relative">
      {!isLoading && error && (
        <ErrorBanner
          label="Some error occurred, unable to load stats"
          error={error}
        />
      )}
      <div className="grid grid-cols-2 md:grid-cols-4">
        {isLoading &&
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="px-4 py-4 border-r last:border-r-0 border-border/60"
            >
              <div className="h-5 w-16 bg-muted animate-pulse mb-2 rounded" />
              <div className="h-3 w-12 bg-muted animate-pulse rounded" />
            </div>
          ))}

        {!isLoading &&
          !error &&
          counts.map((stat) => {
            return (
              <div
                key={stat.title}
                className="px-4 py-4 border-r border-border/60 flex items-center justify-between relative first:border-l last:border-r"
              >
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-lg font-medium mt-1">{stat.value}</p>
                </div>

                <HugeiconsIcon
                  icon={stat.icon}
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={2}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
