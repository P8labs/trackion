import {
  AnalyticsUpIcon,
  Clock01Icon,
  EyeIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { useDashboardCounts } from "../../hooks/useApi";
import { formatTimeSpent } from "@/lib/utils";
import PlusDecor from "../PlusDecor";
import { HugeiconsIcon } from "@hugeicons/react";

interface DashboardCountsProps {
  projectId: string;
}
export function DashboardCounts({ projectId }: DashboardCountsProps) {
  const { data, isLoading, error } = useDashboardCounts(projectId);

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

        {!isLoading && error && (
          <div className="col-span-full px-4 py-6 text-sm text-muted-foreground text-center">
            Failed to load stats
          </div>
        )}

        {!isLoading &&
          !error &&
          counts.map((stat) => {
            return (
              <div
                key={stat.title}
                className="
                  px-4 py-4
                  border-r border-border/60
                  flex items-center justify-between relative
                  first:border-l
                  last:border-r
                "
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

                <PlusDecor position="top" />
                <PlusDecor />
              </div>
            );
          })}
      </div>
    </div>
  );
}
