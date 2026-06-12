import { Center, Divider, Group, Skeleton, Stack, Text } from "@mantine/core";

import { Clock3, Eye, Users } from "lucide-react";

import { analyticsHooks } from "@/hooks/queries/use-analytics";
import { formatTimeSpent } from "@/lib/utils";

interface TopPagesProps {
  projectId: string;
}

export function TopPages({ projectId }: TopPagesProps) {
  const { data, isLoading, error } = analyticsHooks.useTopPages(projectId);

  return (
    <Stack gap={0}>
      <div className="px-5 md:px-6 py-5">
        <Text fw={600} size="sm">
          Top Pages
        </Text>

        <Text size="sm" c="dimmed">
          Most popular pages on your site
        </Text>
      </div>

      {isLoading ? (
        <Stack gap={0}>
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div key={index}>
              <div className="px-5 md:px-6 py-3">
                <Group justify="space-between">
                  <Skeleton h={14} w={180} />

                  <Skeleton h={14} w={120} />
                </Group>
              </div>

              {index !== 5 && <Divider />}
            </div>
          ))}
        </Stack>
      ) : error ? (
        <EmptyState label="Failed to load top pages data" />
      ) : !data?.length ? (
        <EmptyState label="No page data available" />
      ) : (
        <Stack gap={0}>
          {data.map((page, index) => (
            <div key={page.path || index}>
              <div className="px-5 md:px-6 py-3">
                <Group justify="space-between" align="center" wrap="nowrap">
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Text size="sm" fw={500} truncate title={page.path}>
                      {page.path || "/"}
                    </Text>
                  </div>

                  <Group gap="lg">
                    <Metric icon={<Eye size={14} />} value={page.total_views} />

                    <Metric
                      icon={<Users size={14} />}
                      value={page.unique_visitors}
                    />

                    <Metric
                      icon={<Clock3 size={14} />}
                      value={formatTimeSpent(page.avg_time_seconds)}
                    />
                  </Group>
                </Group>
              </div>

              {index !== data.length - 1 && <Divider />}
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function Metric({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string | number;
}) {
  return (
    <Group gap={4} wrap="nowrap">
      <Text c="dimmed" size="xs">
        {icon}
      </Text>

      <Text size="sm" fw={600}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </Text>
    </Group>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Center py="xl">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Center>
  );
}
