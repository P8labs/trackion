import { OnlineUsersChip } from "@/components/core/project/analytics/online-users-chip";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { ActionIcon, Group, Stack, Text, Tooltip } from "@mantine/core";
import { useState } from "react";

interface Props {
  chipLabel?: string;
  label: string;
  description?: string;
  projectId: string;
  refreshKeys?: unknown[][];
}

export function BaseHeader({
  label,
  description,
  projectId,
  refreshKeys,
}: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    if (refreshing) return;

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
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Group
      justify="space-between"
      align="flex-start"
      gap="md"
      className="px-5 md:px-6 py-5"
    >
      <Stack gap={2}>
        <Text fw={600} size="sm">
          {label}
        </Text>

        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
      </Stack>

      <Group gap="xs">
        <OnlineUsersChip projectId={projectId} />

        <Tooltip label="Refresh data">
          <ActionIcon
            variant="subtle"
            loading={refreshing}
            onClick={handleRefresh}
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}
