import { useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Paper,
  Pill,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { Pencil, Trash2 } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";

import { projectHooks } from "@/hooks/queries/use-project";

import { projectQueryKeys } from "@trackion/lib/queries";
import type { RuntimeFlag } from "@trackion/lib/types";

interface Props {
  projectId: string;
  flags: RuntimeFlag[];
}

export default function RemoteConfigFlagsEditor({ flags, projectId }: Props) {
  const qc = useQueryClient();

  const deleteFlagMutation = projectHooks.useDeleteRuntimeFlag(projectId);

  const upsertFlagMutation = projectHooks.useUpsertRuntimeFlag(projectId);

  const [flagKey, setFlagKey] = useState("");
  const [flagEnabled, setFlagEnabled] = useState(true);
  const [flagRollout, setFlagRollout] = useState(100);

  async function refresh() {
    await qc.invalidateQueries({
      queryKey: projectQueryKeys.projectRuntime(projectId),
    });
  }

  async function handleDeleteFlag(key: string) {
    await deleteFlagMutation.mutateAsync(key);
    await refresh();
  }

  async function handleSaveFlag() {
    await upsertFlagMutation.mutateAsync({
      flagKey,
      enabled: flagEnabled,
      rollout_percentage: flagRollout,
    });

    setFlagKey("");
    setFlagEnabled(true);
    setFlagRollout(100);

    await refresh();
  }

  return (
    <Stack gap="lg">
      <div>
        <Text fw={600} size="sm">
          Feature Flags
        </Text>

        <Text size="sm" c="dimmed">
          Boolean flags with rollout percentages.
        </Text>
      </div>

      <Paper withBorder p="md">
        <Stack>
          <TextInput
            label="Flag Key"
            placeholder="new_dashboard"
            value={flagKey}
            onChange={(e) => setFlagKey(e.currentTarget.value)}
          />

          <Group grow align="flex-end">
            <NumberInput
              label="Rollout"
              suffix="%"
              min={0}
              max={100}
              value={flagRollout}
              onChange={(value) => setFlagRollout(Number(value) || 0)}
            />

            <Switch
              label="Enabled"
              checked={flagEnabled}
              onChange={(e) => setFlagEnabled(e.currentTarget.checked)}
            />
          </Group>

          <Button
            onClick={handleSaveFlag}
            loading={upsertFlagMutation.isPending}
            disabled={!flagKey.trim()}
          >
            Save Flag
          </Button>
        </Stack>
      </Paper>

      <div>
        {flags.length === 0 ? (
          <Paper withBorder p="md">
            <Text size="sm" c="dimmed">
              No feature flags configured.
            </Text>
          </Paper>
        ) : (
          flags.map((flag) => (
            <Paper
              className="cursor-pointer first:rounded-b-none! last:rounded-t-none! only:rounded-lg! transition-colors"
              key={flag.key}
              withBorder
              p="sm"
            >
              <Group justify="space-between">
                <div>
                  <Group gap="xs">
                    <Text ff="monospace" fw={500} size="sm">
                      {flag.key}
                    </Text>

                    <Pill variant="contrast">{flag.rollout_percentage}%</Pill>
                  </Group>
                </div>

                <Group gap={4}>
                  <Pill c={flag.enabled ? "green" : "red"}>
                    {flag.enabled ? "Enabled" : "Disabled"}
                  </Pill>
                  <ActionIcon
                    variant="subtle"
                    onClick={() => {
                      setFlagKey(flag.key);
                      setFlagEnabled(flag.enabled);
                      setFlagRollout(flag.rollout_percentage);
                    }}
                  >
                    <Pencil size={14} />
                  </ActionIcon>

                  <ActionIcon
                    color="red"
                    variant="subtle"
                    loading={deleteFlagMutation.isPending}
                    onClick={() => handleDeleteFlag(flag.key)}
                  >
                    <Trash2 size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))
        )}
      </div>
    </Stack>
  );
}
