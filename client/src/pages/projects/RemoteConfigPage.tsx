import { useParams } from "react-router-dom";
import { Badge, Divider, Paper, Tabs, Text } from "@mantine/core";

import { projectHooks } from "@/hooks/queries/use-project";

import { ErrorBanner } from "@/components/core/error-banner";
import { LoadingView } from "@/Loader";

import RemoteConfigFlagsEditor from "@/components/core/project/remote-config/remote-config-flags-editor";
import RemoteConfigEditor from "@/components/core/project/remote-config/remote-config-editor";

export function RemoteConfigPage() {
  const { id = "" } = useParams<{ id: string }>();

  const {
    data: runtimeData,
    isLoading,
    error,
  } = projectHooks.useProjectRuntime(id);

  if (isLoading) {
    return <LoadingView />;
  }

  if (!runtimeData || error) {
    return (
      <ErrorBanner
        error={error}
        label="Failed to load runtime configuration."
      />
    );
  }

  return (
    <Paper>
      <div className="px-5 md:px-6 py-5">
        <Text fw={600} size="xl">
          Remote Config
        </Text>

        <Text size="sm" c="dimmed">
          Manage feature flags and runtime configuration for{" "}
          {runtimeData.project.name}
        </Text>
      </div>

      <Divider />

      <Tabs defaultValue="flags">
        <div className="px-5 md:px-6 py-3">
          <Tabs.List>
            <Tabs.Tab
              value="flags"
              rightSection={
                <Badge variant="light" size="xs">
                  {runtimeData.flags.length}
                </Badge>
              }
            >
              Feature Flags
            </Tabs.Tab>

            <Tabs.Tab
              value="configs"
              rightSection={
                <Badge variant="light" size="xs">
                  {runtimeData.configs.length}
                </Badge>
              }
            >
              Runtime Config
            </Tabs.Tab>
          </Tabs.List>
        </div>

        <Tabs.Panel value="flags">
          <div className="px-5 md:px-6 py-5">
            <RemoteConfigFlagsEditor
              flags={runtimeData.flags}
              projectId={runtimeData.project.id}
            />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="configs">
          <div className="px-5 md:px-6 py-5">
            <RemoteConfigEditor
              configs={runtimeData.configs}
              projectId={runtimeData.project.id}
            />
          </div>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}
