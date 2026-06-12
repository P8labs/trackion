import { useState } from "react";
import {
  ActionIcon,
  Button,
  Code,
  Group,
  JsonInput,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Pencil, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { projectHooks } from "@/hooks/queries/use-project";

import { projectQueryKeys } from "@/lib/queries";
import type { RuntimeConfig } from "@/types";

interface Props {
  projectId: string;
  configs: RuntimeConfig[];
}

export default function RemoteConfigEditor({ configs, projectId }: Props) {
  const qc = useQueryClient();

  const upsertConfigMutation = projectHooks.useUpsertRuntimeConfig(projectId);

  const deleteConfigMutation = projectHooks.useDeleteRuntimeConfig(projectId);

  const [configKey, setConfigKey] = useState("");
  const [configValue, setConfigValue] = useState("{}");

  const isConfigJsonValid = (() => {
    try {
      JSON.parse(configValue);
      return true;
    } catch {
      return false;
    }
  })();

  async function refresh() {
    await qc.invalidateQueries({
      queryKey: projectQueryKeys.projectRuntime(projectId),
    });
  }

  async function onSave() {
    if (!configKey.trim() || !isConfigJsonValid) {
      return;
    }

    await upsertConfigMutation.mutateAsync({
      configKey,
      value: JSON.parse(configValue),
    });

    setConfigKey("");
    setConfigValue("{}");

    await refresh();
  }

  async function onDelete(key: string) {
    await deleteConfigMutation.mutateAsync(key);
    await refresh();
  }

  return (
    <Stack gap="lg">
      <div>
        <Text fw={600} size="sm">
          Runtime Config
        </Text>

        <Text size="sm" c="dimmed">
          Runtime JSON values available to clients.
        </Text>
      </div>

      <Stack gap="md">
        <TextInput
          label="Config Key"
          placeholder="homepage.banner"
          value={configKey}
          onChange={(e) => setConfigKey(e.currentTarget.value)}
        />

        <JsonInput
          autosize
          minRows={10}
          maxRows={20}
          ff="monospace"
          formatOnBlur
          value={configValue}
          onChange={setConfigValue}
          validationError="Invalid JSON"
          onKeyDown={async (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              await onSave();
            }
          }}
        />

        <Group justify="space-between">
          <Group gap="xs">
            <Select
              size="xs"
              placeholder="Insert snippet"
              data={[
                {
                  value: "{}",
                  label: "Empty Object",
                },
                {
                  value: "[]",
                  label: "Empty Array",
                },
                {
                  value: '{"enabled": true}',
                  label: "Boolean Flag",
                },
                {
                  value: '{"title":"","description":""}',
                  label: "Content Block",
                },
              ]}
              onChange={(value) => {
                if (value) {
                  setConfigValue(value);
                }
              }}
            />
          </Group>

          <Text size="xs" c="dimmed">
            {configValue.length} chars
          </Text>
        </Group>

        <Button
          onClick={onSave}
          loading={upsertConfigMutation.isPending}
          disabled={!configKey.trim() || !isConfigJsonValid}
        >
          Save Config
        </Button>

        <Text size="xs" c="dimmed">
          Tip: Press Ctrl/Cmd + Enter to save.
        </Text>
      </Stack>

      <Stack gap={0}>
        {configs.map((item) => (
          <div key={item.key} className="px-1 py-3">
            <Group justify="space-between" mb="xs">
              <Text ff="monospace" size="sm">
                {item.key}
              </Text>

              <Group gap={4}>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    setConfigKey(item.key);
                    setConfigValue(JSON.stringify(item.value, null, 2));
                  }}
                >
                  <Pencil size={14} />
                </ActionIcon>

                <ActionIcon
                  color="red"
                  variant="subtle"
                  size="sm"
                  loading={deleteConfigMutation.isPending}
                  onClick={() => onDelete(item.key)}
                >
                  <Trash2 size={14} />
                </ActionIcon>
              </Group>
            </Group>

            <Code
              block
              style={{
                fontSize: 12,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(item.value, null, 2)}
            </Code>
          </div>
        ))}
      </Stack>
    </Stack>
  );
}
