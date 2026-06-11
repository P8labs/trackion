import { analyticsHooks } from "@/hooks/queries/use-analytics";
import { ErrorBanner } from "@/components/core/error-banner";
import { LoadingBanner } from "@/components/core/loading-banner";

import { ScrollArea, SimpleGrid, Stack, Text } from "@mantine/core";
import { Heatmap } from "@mantine/charts";
import { IsMobile } from "@/lib/flags";

export function TrafficHeatmap({ projectId }: { projectId: string }) {
  const { data, isLoading, error } =
    analyticsHooks.useTrafficHeatmap(projectId);

  const stats = {
    today: data?.stats?.today ?? 0,
    weeklyAvg: data?.stats?.weekly_avg ?? 0,
    monthlyAvg: data?.stats?.monthly_avg ?? 0,
  };

  if (isLoading) {
    return <LoadingBanner label="Loading traffic heatmap..." />;
  }

  if (error) {
    return (
      <ErrorBanner error={error} label="Failed to load traffic heatmap data." />
    );
  }

  return (
    <Stack gap={0}>
      <div className="px-5 md:px-6 py-5">
        <Text fw={600} size="sm">
          Traffic
        </Text>

        <Text size="sm" c="dimmed">
          Activity distribution across the last year
        </Text>
      </div>

      <div className="px-5 md:px-6 pb-5">
        <ScrollArea type="hover" offsetScrollbars>
          <div
            style={{
              minWidth: 760,
            }}
          >
            <Heatmap
              data={data?.calendar || {}}
              startDate={data?.start_date}
              endDate={data?.end_date}
              withMonthLabels
              withWeekdayLabels
              rectSize={IsMobile() ? 10 : 12}
              rectRadius={2}
              gap={2}
              colors={[
                "var(--mantine-color-blue-4)",
                "var(--mantine-color-blue-6)",
                "var(--mantine-color-blue-7)",
                "var(--mantine-color-blue-9)",
              ]}
              withTooltip
            />
          </div>
        </ScrollArea>
      </div>

      <div className="px-5 md:px-6 pb-6">
        <SimpleGrid cols={3}>
          <Metric label="Today" value={stats.today} />

          <Metric label="Weekly Avg" value={stats.weeklyAvg} />

          <Metric label="Monthly Avg" value={stats.monthlyAvg} />
        </SimpleGrid>
      </div>
    </Stack>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>

      <Text fw={600}>{value.toLocaleString()}</Text>
    </Stack>
  );
}
