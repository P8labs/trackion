import { useParams } from "react-router-dom";
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Grid,
  Group,
  Paper,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { Trash2 } from "lucide-react";

import { projectHooks } from "@/hooks/queries/use-project";
import { useGlobalStore } from "@/store";

import { LoadingBanner } from "@/components/core/loading-banner";
import { ErrorBanner } from "@/components/core/error-banner";

import { EditProjectDetailsModal } from "@/components/core/project/modals/edit-project-details-modal";
import { DeleteProjectModal } from "@/components/core/project/modals/delete-project-modal";
import { useDisclosure } from "@mantine/hooks";
import { CodeHighlight } from "@mantine/code-highlight";

export function ProjectDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { serverURL } = useGlobalStore();

  const [deleteOpen, { close: closeDeleteOpen, open: openDeleteOpen }] =
    useDisclosure(false);
  const [editOpen, { close: closeEditOpen, open: openEditOpen }] =
    useDisclosure(false);

  const { data: project, isLoading, error } = projectHooks.useProject(id);

  if (isLoading) {
    return <LoadingBanner />;
  }

  if (!project || error) {
    return (
      <ErrorBanner
        error={error}
        label="The project you are looking for does not exist or has been deleted."
      />
    );
  }

  const scriptSnippet = `<!-- Trackion Analytics -->
<script
  src="${serverURL}/t.js"
  data-api-key="${project.api_key}"
></script>`;

  return (
    <>
      <Paper>
        <div className="px-5 md:px-6 py-5">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={600} size="xl" mt={4}>
                {project.name}
              </Text>

              <Text size="sm" c="dimmed">
                Settings and integration details
              </Text>
            </div>

            <Group gap="xs">
              <Button variant="default" onClick={() => openEditOpen()}>
                Edit
              </Button>

              <ActionIcon
                color="red"
                variant="light"
                size="lg"
                onClick={() => openDeleteOpen()}
              >
                <Trash2 size={20} />
              </ActionIcon>
            </Group>
          </Group>
        </div>

        <Divider />
        <div className="px-5 md:px-6 py-5">
          <Text fw={600} size="sm">
            Your API Key and Integration Snippet
          </Text>

          <Text size="sm" c="dimmed" mb="md">
            Use the following API key and script snippet to integrate Trackion
            into your application.
          </Text>

          <Stack gap="sm">
            <CodeHighlight code={project.api_key} language="html" />
            <CodeHighlight code={scriptSnippet} language="html" radius="md" />
          </Stack>
        </div>

        <Divider />

        <div className="px-5 md:px-6 py-5">
          <Text fw={600} size="sm">
            Project Configuration
          </Text>

          <Text size="sm" c="dimmed" mb="lg">
            Domains and tracking features configured for this project.
          </Text>

          <Stack gap="xl">
            <div>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm">
                Domains
              </Text>

              {(project.domains || []).length > 0 ? (
                <Group gap="xs">
                  {project.domains.map((domain) => (
                    <Badge
                      key={domain}
                      variant="light"
                      radius="sm"
                      className="normal-case!"
                    >
                      {domain}
                    </Badge>
                  ))}
                </Group>
              ) : (
                <Text size="sm" c="dimmed">
                  No domains configured
                </Text>
              )}
            </div>

            <div>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm">
                Tracking Features
              </Text>

              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <FeatureItem
                    title="Auto Pageview"
                    description="Capture page views automatically on route changes."
                    checked={project.settings.auto_pageview}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <FeatureItem
                    title="Time Spent"
                    description="Measure engaged time on each page."
                    checked={project.settings.time_spent}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <FeatureItem
                    title="Campaign Tracking"
                    description="Track UTM source, medium and campaign values."
                    checked={project.settings.campaign}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <FeatureItem
                    title="Click Tracking"
                    description="Track CTA clicks and interaction hotspots."
                    checked={project.settings.clicks}
                  />
                </Grid.Col>
              </Grid>
            </div>
          </Stack>
        </div>
      </Paper>

      <EditProjectDetailsModal
        opened={editOpen}
        close={closeEditOpen}
        project={project}
      />

      <DeleteProjectModal
        close={closeDeleteOpen}
        opened={deleteOpen}
        projectName={project.name}
        projectId={project.id}
      />
    </>
  );
}

function FeatureItem({
  title,
  description,
  checked,
}: {
  title: string;
  description: string;
  checked: boolean;
}) {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap">
      <div>
        <Text size="sm" fw={500}>
          {title}
        </Text>

        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </div>

      <Switch checked={checked} />
    </Group>
  );
}
