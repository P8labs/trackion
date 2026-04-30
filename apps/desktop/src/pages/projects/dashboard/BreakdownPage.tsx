import { useParams } from "react-router-dom";
import { AnalyticsBreakdown } from "@/components/core/project/analytics/analytics-breakdown";
import { TopCountries } from "@/components/core/project/analytics/top-country-traffic";
import { TopPages } from "@/components/core/project/analytics/top-pages-traffic";
import { BaseHeader } from "@/components/core/project/analytics/base-header";

export function BreakdownPage() {
  const { id: projectId = "" } = useParams<{ id: string }>();

  return (
    <section className="max-w-7xl mx-auto relative">
      <BaseHeader
        label="Breakdown"
        description="Traffic breakdown and performance insights"
        projectId={projectId}
      />

      <AnalyticsBreakdown projectId={projectId} />
      <div className="grid lg:grid-cols-2 border-b border-border/60">
        <div className="border-r border-border/60">
          <TopCountries projectId={projectId} />
        </div>
        <TopPages projectId={projectId} />
      </div>
    </section>
  );
}
