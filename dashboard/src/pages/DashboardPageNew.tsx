import { useStore } from "../store";
import { StatsCards } from "../components/dashboard/StatsCards";
import { EventsChart } from "../components/dashboard/EventsChart";
import { BreakdownSection } from "../components/dashboard/BreakdownSection";
import { RecentEvents } from "../components/dashboard/RecentEvents";

export function DashboardPage() {
  const { currentProject } = useStore();

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="text-center">
          <p className="text-foreground text-lg">No project selected</p>
          <p className="text-muted-foreground text-sm mt-2">
            Create a project to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {currentProject.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time analytics dashboard
          </p>
        </div>
      </div>

      {/* Stats Cards - Separate API Call */}
      <StatsCards projectId={currentProject.id} />

      {/* Events Chart - Separate API Call with Filters */}
      <EventsChart projectId={currentProject.id} />

      {/* Breakdown Section - Separate API Call */}
      <BreakdownSection projectId={currentProject.id} />

      {/* Recent Events - Separate API Call */}
      <RecentEvents projectId={currentProject.id} />
    </div>
  );
}
