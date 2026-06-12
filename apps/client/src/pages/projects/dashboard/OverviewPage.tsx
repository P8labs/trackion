import { Suspense } from "react";
import { useParams } from "react-router-dom";

import { Divider, Paper, Skeleton } from "@mantine/core";

import { LoadingView } from "@/Loader";
import { ErrorBanner } from "@/components/core/error-banner";

import { BaseHeader } from "@/components/core/project/analytics/base-header";
import { DashboardChart } from "@/components/core/project/analytics/dashboard-chart";
import { DashboardStats } from "@/components/core/project/analytics/dashboard-stats";
import { GeoTraffic } from "@/components/core/project/analytics/geo-traffic";
import { TrafficHeatmap } from "@/components/core/project/analytics/traffic-heatmap";

import { projectHooks } from "@/hooks/queries/use-project";

import { analyticsQueryKeys } from "@trackion/lib/queries";

export function OverviewPage() {
  const { id = "" } = useParams<{ id: string }>();

  const { data: activeProject, isLoading, error } = projectHooks.useProject(id);

  if (isLoading) {
    return <LoadingView />;
  }

  if (!activeProject || error) {
    return (
      <ErrorBanner
        error={error}
        label="The project you are looking for does not exist or has been deleted."
      />
    );
  }

  return (
    <Paper>
      <BaseHeader
        label={activeProject.name}
        description="Real-time analytics and insights"
        projectId={activeProject.id}
        refreshKeys={[
          [analyticsQueryKeys.stats(activeProject.id)],
          [analyticsQueryKeys.onlineUsers(activeProject.id)],
          [analyticsQueryKeys.chartData(activeProject.id, "7d", "all")],
        ]}
      />

      <Divider />

      <Suspense fallback={<OverviewFallback height={80} />}>
        <DashboardStats projectId={activeProject.id} />
      </Suspense>

      <Divider />

      <Suspense fallback={<OverviewFallback height={320} />}>
        <DashboardChart projectId={activeProject.id} />
      </Suspense>

      <Divider />

      <Suspense fallback={<OverviewFallback height={420} />}>
        <TrafficHeatmap projectId={activeProject.id} />
      </Suspense>
      <Suspense fallback={<OverviewFallback height={420} />}>
        <GeoTraffic projectId={activeProject.id} />
      </Suspense>
    </Paper>
  );
}

function OverviewFallback({ height }: { height: number }) {
  return (
    <div className="px-5 md:px-6 py-5">
      <Skeleton height={height} />
    </div>
  );
}
