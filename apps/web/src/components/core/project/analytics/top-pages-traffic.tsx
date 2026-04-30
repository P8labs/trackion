import { Clock, Users, Eye } from "lucide-react";
import { formatTimeSpent } from "@/lib/utils";
import { analyticsHooks } from "@/hooks/queries/use-analytics";

interface TopPagesProps {
  projectId: string;
}

export function TopPages({ projectId }: TopPagesProps) {
  const { data, isLoading, error } = analyticsHooks.useTopPages(projectId);

  return (
    <section className="h-90 flex flex-col">
      <div className="border-b border-border/60 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          Top Pages
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Most popular pages on your site
        </p>
      </div>

      {isLoading ? (
        <div className="divide-y divide-border/40 overflow-y-auto flex-1">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="h-3 w-40 animate-pulse rounded bg-muted/50" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted/50" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Failed to load top pages data
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No page data available
        </div>
      ) : (
        <div className="divide-y divide-border/40 overflow-y-auto flex-1">
          {data.map((page, index) => (
            <div
              key={index}
              className="grid grid-cols-12 items-center gap-3 px-4 py-2.5 transition hover:bg-muted/20"
            >
              <div className="col-span-6 min-w-0">
                <p
                  className="truncate text-sm font-medium text-foreground"
                  title={page.path}
                >
                  {page.path || "/"}
                </p>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span className="font-mono text-foreground">
                  {page.total_views.toLocaleString()}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span className="font-mono text-foreground">
                  {page.unique_visitors.toLocaleString()}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="font-mono text-foreground">
                  {formatTimeSpent(page.avg_time_seconds)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
