import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { DashboardStats } from "@/components/core/project/analytics/dashboard-stats";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import { OverviewGeoTraffic } from "@/components/dashboard/OverviewGeoTraffic";

import { projectHooks } from "@/hooks/queries/use-project";
import { ErrorBanner } from "@/components/core/error-banner";
import { BaseHeader } from "@/components/core/project/analytics/base-header";
import { LoadingBanner } from "@/components/core/loading-banner";

export function OverviewPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: activeProject, isLoading, error } = projectHooks.useProject(id);

  if (isLoading) {
    return <LoadingBanner />;
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
    <section className="max-w-7xl mx-auto relative">
      <BaseHeader
        chipLabel="Overview"
        label={activeProject.name}
        description={"Real-time analytics and insights"}
        projectId={activeProject.id}
      />

      <div className="relative">
        <Suspense fallback={<OverviewCardFallback heightClass="h-32" />}>
          <DashboardStats projectId={activeProject.id} />
        </Suspense>
        <Suspense fallback={<OverviewCardFallback heightClass="h-80" />}>
          <DashboardChart projectId={activeProject.id} />
        </Suspense>
        <Suspense fallback={<OverviewCardFallback heightClass="h-[28rem]" />}>
          <OverviewGeoTraffic projectId={activeProject.id} />
        </Suspense>
      </div>
    </section>
  );
}

function OverviewCardFallback({ heightClass }: { heightClass: string }) {
  return (
    <div className="w-full border bg-card p-4 mb-6">
      <div className={`w-full animate-pulse bg-muted/25 ${heightClass}`} />
    </div>
  );
}
