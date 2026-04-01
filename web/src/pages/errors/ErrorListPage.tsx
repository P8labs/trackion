import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Bug } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { useStore } from "../../store";
import { getGroupedErrors, getErrorStats } from "../../lib/api";
import type { GroupedError } from "../../types";
import { formatDistanceToNow } from "date-fns";

export function ErrorListPage() {
  const navigate = useNavigate();
  const { authToken, serverUrl, currentProject } = useStore();
  const [timeRange, setTimeRange] = useState("7d");

  const { data: errors, isLoading: errorsLoading } = useQuery({
    queryKey: ["grouped-errors", currentProject?.id, timeRange],
    queryFn: () =>
      getGroupedErrors(currentProject!.id, timeRange, serverUrl, authToken!),
    enabled: !!currentProject && !!authToken,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["error-stats", currentProject?.id, timeRange],
    queryFn: () =>
      getErrorStats(currentProject!.id, timeRange, serverUrl, authToken!),
    enabled: !!currentProject && !!authToken,
  });

  const handleRowClick = (fingerprint: string) => {
    navigate(`/projects/${currentProject?.id}/errors/${fingerprint}`);
  };

  const truncateMessage = (message: string, maxLength = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="w-full max-w-md border border-border/60 p-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-3">
            No Project Selected
          </h2>
          <p className="text-muted-foreground mb-6">
            Please select a project to view error tracking.
          </p>
          <Button
            onClick={() => navigate("/projects")}
            className="w-full h-10 text-sm"
          >
            Go to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto border-b border-border/60">
      <section className="px-4 py-3 md:px-6 border-b border-border/60 flex items-start justify-between gap-4">
        <div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Error Tracking
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Grouped exceptions for {currentProject.name}
          </p>
        </div>

        <div className="flex gap-2">
          {["24h", "7d", "30d"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="h-8 px-3 text-xs"
            >
              {range}
            </Button>
          ))}
        </div>
      </section>

      <section className="px-4 py-3 md:px-6 border-b border-border/60">
        {statsLoading ? (
          <Skeleton className="h-14 w-full" />
        ) : stats ? (
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-2xl font-semibold text-foreground">
              {stats.total_errors}
            </p>
            <p className="text-xs text-muted-foreground">
              total errors in {timeRange}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No error stats available
          </p>
        )}
      </section>

      <section className="border-b border-border/60">
        <div className="grid grid-cols-[minmax(0,1fr)_90px_120px_120px] border-b border-border/60 px-4 py-2 md:px-6 text-[11px] uppercase tracking-wide text-muted-foreground">
          <span>Error Message</span>
          <span>Count</span>
          <span>Last Seen</span>
          <span>First Seen</span>
        </div>

        {errorsLoading ? (
          <div className="px-4 py-3 md:px-6 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : errors && errors.length > 0 ? (
          <div className="divide-y divide-border/60">
            {errors.map((error: GroupedError) => (
              <button
                key={error.fingerprint}
                onClick={() => handleRowClick(error.fingerprint)}
                className="w-full grid grid-cols-[minmax(0,1fr)_90px_120px_120px] items-start gap-3 px-4 py-2.5 md:px-6 text-left transition hover:bg-muted/20"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {truncateMessage(error.message)}
                      </p>
                      {error.last_url && (
                        <p className="text-xs text-muted-foreground truncate">
                          {error.last_url}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {error.count}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground pt-0.5">
                  {formatTimeAgo(error.last_seen)}
                </p>

                <p className="text-xs text-muted-foreground pt-0.5">
                  {formatTimeAgo(error.first_seen)}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-10 md:px-6 text-center">
            <Bug className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
            <h3 className="text-base font-semibold mb-1">No errors found</h3>
            <p className="text-xs text-muted-foreground">
              Great news! No errors were captured in the selected time range.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
