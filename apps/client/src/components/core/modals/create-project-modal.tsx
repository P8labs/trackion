import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { parseDomainsInput } from "@/lib/domain";
import type { ProjectSettings } from "@trackion/lib/types";

import z from "zod";
import { useMediaQuery } from "@mantine/hooks";

export const defaultProjectSettings: ProjectSettings = {
  auto_pageview: true,
  time_spent: true,
  campaign: true,
  clicks: true,
};

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  domains: z.array(
    z
      .string()
      .min(5, "Please enter at least one domain")
      .refine((v) => {
        const { invalidDomains } = parseDomainsInput(v);
        return invalidDomains.length === 0;
      }, "One or more domains are invalid. Please check your input."),
  ),
  settings: z.object({
    auto_pageview: z.boolean(),
    time_spent: z.boolean(),
    campaign: z.boolean(),
    clicks: z.boolean(),
  }),
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;

interface Props {
  opened: boolean;
  close: () => void;
}

export function CreateProjectModal({ opened, close }: Props) {
  const navigate = useNavigate();
  const createProjectMutation = projectHooks.useCreateProject();
  const mobile = useMediaQuery("(max-width: 768px)");

  const form = useForm<CreateProjectData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      domains: [],
      settings: defaultProjectSettings,
    },
  });

  useEffect(() => {
    if (opened) {
      form.reset();
    }
  }, [opened, form]);

  const handleCreateProject = async (data: CreateProjectData) => {
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
      <form onSubmit={form.handleSubmit(handleCreateProject)}>
        <Stack gap="xl" mt="sm">
          <Stack gap="md">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  label="Project Name"
                  description="Use a clear name so your team can quickly identify this property."
                  placeholder="Marketing Website"
                  error={fieldState.error?.message}
                  disabled={createProjectMutation.isPending}
                  data-autofocus
                  withAsterisk
                />
              )}
            />

            <Controller
              name="domains"
              control={form.control}
              render={({ field, fieldState }) => (
                <TagsInput
                  {...field}
                  label="Allowed Domains"
                  description="Press Enter to add multiple domains. Protocols like https:// are not needed."
                  placeholder="example.com"
                  error={fieldState.error?.message}
                  disabled={createProjectMutation.isPending}
                  clearable
                  withAsterisk
                />
              )}
            />
          </Stack>

          <Divider />

          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
              <Controller
                name="settings.auto_pageview"
                control={form.control}
                render={({ field }) => (
                  <Switch
                    label="Auto Pageview"
                    description="Capture page views automatically on route changes."
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={createProjectMutation.isPending}
                  />
                )}
              />

              <Controller
                name="settings.time_spent"
                control={form.control}
                render={({ field }) => (
                  <Switch
                    label="Time Spent"
                    description="Measure engaged time on each page."
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={createProjectMutation.isPending}
                  />
                )}
              />

              <Controller
                name="settings.campaign"
                control={form.control}
                render={({ field }) => (
                  <Switch
                    label="Campaign Tracking"
                    description="Track UTM source, medium, and campaign values."
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={createProjectMutation.isPending}
                  />
                )}
              />

              <Controller
                name="settings.clicks"
                control={form.control}
                render={({ field }) => (
                  <Switch
                    label="Click Tracking"
                    description="Track CTA clicks and interaction hotspots."
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={createProjectMutation.isPending}
                  />
                )}
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
