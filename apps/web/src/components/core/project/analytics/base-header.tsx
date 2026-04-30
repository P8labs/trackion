import { OnlineUsersChip } from "@/components/core/project/analytics/online-users-chip";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@trackion/ui/button";
import { useState } from "react";

interface Props {
  chipLabel?: string;
  label: string;
  description?: string;
  projectId: string;
  refreshKeys?: unknown[][]; // Optional array of query keys to refresh
}

export function BaseHeader({
  chipLabel,
  label,
  description,
  projectId,
  refreshKeys,
}: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }

    try {
      setRefreshing(true);
      await Promise.all(
        (refreshKeys || []).map((key) =>
          queryClient.invalidateQueries({
            queryKey: [...key],
            exact: true,
          }),
        ),
      );
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="px-4 md:px-6 py-6 border-b border-border/60 relative">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {chipLabel && (
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {chipLabel}
            </p>
          )}
          <h1 className="mt-1 text-xl font-medium tracking-tight md:text-2xl">
            {label}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          <OnlineUsersChip projectId={projectId} />

          <Button
            variant="ghost"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-9 gap-2 px-3 text-sm"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
        </div>
      </div>
    </div>
  );
}
