import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

import {
  Badge,
  Divider,
  Group,
  Paper,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";

import { Bug, ChevronRight } from "lucide-react";

import type { GroupedError } from "@trackion/lib/types";

import { projectHooks } from "@/hooks/queries/use-project";

export function ErrorListPage() {
  const navigate = useNavigate();

  const { id: projectId = "" } = useParams<{
    id: string;
  }>();

  const [timeRange, setTimeRange] = useState("7d");

  const { data: errors, isLoading } = projectHooks.useErrorGroups(
    projectId,
    timeRange,
  );

  const { data: stats, isLoading: statsLoading } =
    projectHooks.useErrorStats(projectId);

  return (
    <Paper>
      <div className="px-5 md:px-6 py-5">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={600} size="xl">
              Error Tracking
            </Text>

            <Text size="sm" c="dimmed">
              Grouped exceptions from the last {timeRange}
            </Text>
          </div>

          <SegmentedControl
            value={timeRange}
            onChange={setTimeRange}
            data={[
              {
                value: "24h",
                label: "24h",
              },
              {
                value: "7d",
                label: "7d",
              },
              {
                value: "30d",
                label: "30d",
              },
            ]}
          />
        </Group>
      </div>

      <Divider />

      <div className="px-5 md:px-6 py-5">
        {statsLoading ? (
          <Skeleton w={100} h={30} />
        ) : (
          <Group gap="md">
            <div>
              <Text size="xl" fw={700}>
                {stats?.total_errors ?? 0}
              </Text>

              <Text size="sm" c="dimmed">
                Total captured errors
              </Text>
            </div>
          </Group>
        )}
      </div>

      <Divider />

      {isLoading ? (
        <Stack gap="sm" p="md">
          {Array.from({
            length: 8,
          }).map((_, i) => (
            <Skeleton key={i} w={100} h={30} />
          ))}
        </Stack>
      ) : errors?.length ? (
        <Stack gap={0}>
          {errors.map((error: GroupedError) => (
            <ErrorRow
              key={error.fingerprint}
              error={error}
              onClick={() =>
                navigate(`/projects/${projectId}/errors/${error.fingerprint}`)
              }
            />
          ))}
        </Stack>
      ) : (
        <div className="px-5 md:px-6 py-16">
          <Stack align="center" gap="xs">
            <Bug size={36} className="opacity-40" />

            <Text fw={500}>No errors found</Text>

            <Text size="sm" c="dimmed" ta="center">
              No exceptions were captured during the selected period.
            </Text>
          </Stack>
        </div>
      )}
    </Paper>
  );
}

function ErrorRow({
  error,
  onClick,
}: {
  error: GroupedError;
  onClick: () => void;
}) {
  return (
    <>
      <button
        onClick={onClick}
        className="cursor-pointer w-full text-left px-5 md:px-6 py-4 transition hover:bg-(--mantine-color-gray-1)! dark:hover:bg-(--mantine-color-dark-4)!"
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div className="min-w-0 flex-1">
            <Group gap="xs" mb={4}>
              <Badge variant="default" color="red">
                Error Stack {error.count}
              </Badge>
            </Group>

            <Text size="sm" fw={500} truncate>
              {error.message}
            </Text>

            {error.last_url && (
              <Text size="xs" c="dimmed" truncate>
                {error.last_url}
              </Text>
            )}

            <Group gap="md" mt={6}>
              <Text size="xs" c="dimmed">
                Last seen {moment(error.last_seen).fromNow()}
              </Text>

              <Text size="xs" c="dimmed">
                First seen {moment(error.first_seen).fromNow()}
              </Text>
            </Group>
          </div>

          <ChevronRight size={16} className="opacity-50 shrink-0" />
        </Group>
      </button>

      <Divider />
    </>
  );
}
