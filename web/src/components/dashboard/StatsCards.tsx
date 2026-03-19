import { ArrowUpRight } from "lucide-react";
import { useDashboardStats } from "../../hooks/useApi";

interface StatsCardsProps {
  projectId: string;
}

export function StatsCards({ projectId }: StatsCardsProps) {
  const { data: stats, isLoading, error } = useDashboardStats(projectId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl px-5 py-4 shadow-lg bg-card animate-pulse"
          >
            <div className="h-6 bg-muted rounded w-20" />
            <div className="mt-2 h-10 bg-muted rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">
        Failed to load stats
      </div>
    );
  }

  if (!stats) return null;

  const formatTimeSpent = (seconds: number) => {
    if (seconds === 0) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    if (minutes > 0) {
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    }
    return `${secs}s`;
  };

  const cards = [
    {
      title: "Total Events",
      value: stats.total_events.toLocaleString(),
      trend: "+11.01%",
    },
    {
      title: "Views",
      value: stats.views.toLocaleString(),
      trend: "+5.2%",
    },
    {
      title: "Unique Views",
      value: stats.unique_views.toLocaleString(),
      trend: "+15.03%",
    },
    {
      title: "Avg Time Spent",
      value: formatTimeSpent(stats.avg_time_spent_seconds),
      trend: "+6.08%",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
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
              <span>{card.trend}</span>
              <ArrowUpRight size={12} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
