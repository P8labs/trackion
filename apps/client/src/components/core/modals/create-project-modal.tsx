import { useNavigate } from "react-router-dom";
import { projectHooks } from "@/hooks/queries/use-project";
import {
  Modal,
  TextInput,
  TagsInput,
  Switch,
  Button,
  Group,
  Stack,
  Text,
  SimpleGrid,
  Divider,
} from "@mantine/core";
import { normalizeSingleDomain } from "@/lib/domain";

import { useMediaQuery } from "@mantine/hooks";
import { hasLength, useForm } from "@mantine/form";
import type { CreateProjectData } from "@/pages/projects/shared";

interface Props {
  opened: boolean;
  close: () => void;
}

export function CreateProjectModal({ opened, close }: Props) {
  const navigate = useNavigate();
  const createProjectMutation = projectHooks.useCreateProject();
  const mobile = useMediaQuery("(max-width: 768px)");

  const form = useForm<CreateProjectData>({
    initialValues: {
      name: "",
      domains: [],
      settings: {
        auto_pageview: true,
        time_spent: true,
        campaign: true,
        clicks: true,
      },
    },
    validate: {
      name: (value) =>
        hasLength({ min: 1 }, value.trim()) &&
        hasLength({ max: 100 }, value.trim())
          ? null
          : "Project name is required and must be less than 100 characters.",
      domains: (value) => {
        try {
          console.log("Validating domains:", value);
          value.forEach((domain) => {
            const normalized = normalizeSingleDomain(domain);
            if (!normalized) {
              throw new Error(`Invalid domain: ${domain}`);
            }
          });
          return null;
        } catch (err) {
          return "One or more domains are invalid. Please check your input.";
        }
      },
    },
  });

  const handleCreateProject = async (data: typeof form.values) => {
    try {
      await createProjectMutation.mutateAsync(data, {
        onSuccess: (project) => {
          close();
          navigate(`/projects/${project.id}`);
        },
      });
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      size="lg"
      title={
        <Text fw={600} size="lg">
          Create New Project
        </Text>
      }
      transitionProps={{ transition: "slide-up" }}
      centered
      fullScreen={mobile}
      id="create-project-modal"
    >
      <form onSubmit={form.onSubmit(handleCreateProject)}>
        <Stack gap="xl" mt="sm">
          <Stack gap="md">
            <TextInput
              {...form.getInputProps("name")}
              label="Project Name"
              description="Use a clear name so your team can quickly identify this property."
              placeholder="Marketing Website"
              disabled={createProjectMutation.isPending}
              data-autofocus
              withAsterisk
            />

            <TagsInput
              {...form.getInputProps("domains")}
              label="Allowed Domains"
              data={[]}
              value={form.values.domains}
              onChange={(formValue) => form.setFieldValue("domains", formValue)}
              description="Press Enter to add multiple domains. Protocols like https:// are not needed."
              placeholder="example.com"
              disabled={createProjectMutation.isPending}
              clearable
              withAsterisk
            />
          </Stack>

          <Divider />

          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
              <Switch
                {...form.getInputProps("settings.auto_pageview", {
                  type: "checkbox",
                })}
                label="Auto Pageview"
                description="Capture page views automatically on route changes."
                disabled={createProjectMutation.isPending}
              />

              <Switch
                {...form.getInputProps("settings.time_spent", {
                  type: "checkbox",
                })}
                label="Time Spent"
                description="Measure engaged time on each page."
                disabled={createProjectMutation.isPending}
              />

              <Switch
                {...form.getInputProps("settings.campaign", {
                  type: "checkbox",
                })}
                label="Campaign Tracking"
                description="Track UTM source, medium, and campaign values."
                disabled={createProjectMutation.isPending}
              />

              <Switch
                {...form.getInputProps("settings.clicks", {
                  type: "checkbox",
                })}
                label="Click Tracking"
                description="Track CTA clicks and interaction hotspots."
                disabled={createProjectMutation.isPending}
              />
            </SimpleGrid>
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={close}
              disabled={createProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createProjectMutation.isPending}
              color="blue"
            >
              Create Project
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
