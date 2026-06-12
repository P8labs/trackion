import {
  Divider,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";

import { ErrorBanner } from "@/components/core/error-banner";
import { analyticsHooks } from "@/hooks/queries/use-analytics";
import { formatTimeSpent } from "@/lib/utils";
import {
  ClockFadingIcon,
  EyeIcon,
  TrendingUpIcon,
  UserPlusIcon,
} from "lucide-react";

interface DashboardStatsProps {
  projectId: string;
}

export function DashboardStats({ projectId }: DashboardStatsProps) {
  const { data, isLoading, error } =
    analyticsHooks.useDashboardStats(projectId);

  const stats = [
    {
      title: "Events",
      value: data?.total_events.toLocaleString() ?? "0",
      icon: TrendingUpIcon,
    },
    {
      title: "Views",
      value: data?.views.toLocaleString() ?? "0",
      icon: EyeIcon,
    },
    {
      title: "Unique Visitors",
      value: data?.unique_views.toLocaleString() ?? "0",
      icon: UserPlusIcon,
    },
    {
      title: "Average Time",
      value: formatTimeSpent(data?.avg_time_spent_seconds ?? 0),
      icon: ClockFadingIcon,
    },
  ];

  return (
    <Stack gap={0}>
      {!isLoading && error && (
        <ErrorBanner
          label="Unable to load analytics statistics"
          error={error}
        />
      )}

      <div className="px-5 md:px-6 py-5">
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
          {stats.map((stat) => (
            <div key={stat.title}>
              {isLoading ? (
                <Stack gap={6}>
                  <Skeleton height={12} width="60%" />
                  <Skeleton height={24} width="80%" />
                </Stack>
              ) : (
                <Stack gap={4}>
                  <Group gap={6}>
                    <stat.icon size={14} />

                    <Text size="xs" fw={600} c="dimmed">
                      {stat.title}
                    </Text>
                  </Group>

                  <Text fw={600} size="xl">
                    {stat.value}
                  </Text>
                </Stack>
              )}
            </div>
          ))}
        </SimpleGrid>
      </div>

      <Divider />
    </Stack>
  );
}
