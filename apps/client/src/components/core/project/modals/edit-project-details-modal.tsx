import { projectHooks } from "@/hooks/queries/use-project";
import { type CreateProjectData } from "@/pages/projects/shared";
import type { ProjectSettings } from "@/types";

import { ErrorBanner } from "@/components/core/error-banner";
import { projectQueryKeys } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Switch,
  TagsInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { normalizeSingleDomain } from "@/lib/utils";

interface EditProjectDetailsProps {
  opened: boolean;
  close: () => void;
  project: CreateProjectData & { id: string };
}

export function EditProjectDetailsModal({
  opened,
  close,
  project,
}: EditProjectDetailsProps) {
  const form = useForm({
    // Removed mode: "uncontrolled" so form.values updates reactively for badges/switches
    initialValues: {
      name: project.name,
      domains: project.domains, // Convert array to string for TextInput
      settings: project.settings,
    },
    validate: {
      name: (value) => {
        if (!value) {
          return "Project name is required";
        }
        return null;
      },
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

  const editProjectMutation = projectHooks.useEditProject(project.id);
  const qc = useQueryClient();

  const onSubmit = async (data: typeof form.values) => {
    try {
      await editProjectMutation.mutateAsync(data, {
        onSuccess: () => {
          close();
          qc.invalidateQueries({
            queryKey: projectQueryKeys.project(project.id),
          });
        },
      });
    } catch (err) {
      console.error("Failed to update project:", err);
    }
  };

  const toggleSetting = (key: keyof ProjectSettings, checked: boolean) => {
    form.setFieldValue(`settings.${key}`, checked);
  };

  return (
    <Modal opened={opened} onClose={close} title="Edit Project" size="lg">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="xl">
          <div>
            <Stack>
              <TextInput
                {...form.getInputProps("name")}
                label="Project Name"
                placeholder="Marketing Website"
                disabled={editProjectMutation.isPending}
              />
              <div>
                <TagsInput
                  {...form.getInputProps("domains")}
                  label="Allowed Domains"
                  data={[]}
                  value={form.values.domains}
                  onChange={(formValue) =>
                    form.setFieldValue("domains", formValue)
                  }
                  description="Press Enter to add multiple domains. Protocols like https:// are not needed."
                  placeholder="example.com"
                  disabled={editProjectMutation.isPending}
                  clearable
                  withAsterisk
                />
              </div>
            </Stack>
          </div>

          <Divider />

          <div>
            <Text fw={600} size="sm" mb="xs">
              Tracking Features
            </Text>

            <Text size="sm" c="dimmed" mb="lg">
              Configure which analytics features are enabled.
            </Text>

            <Stack gap="lg">
              <FeatureSetting
                title="Auto Pageview"
                description="Capture page views automatically on route changes."
                // Replaced non-existent watch() with direct form.values mapping
                checked={form.values.settings.auto_pageview}
                onChange={(v) => toggleSetting("auto_pageview", v)}
                disabled={editProjectMutation.isPending}
              />

              <FeatureSetting
                title="Time Spent"
                description="Measure engaged time on each page."
                checked={form.values.settings.time_spent}
                onChange={(v) => toggleSetting("time_spent", v)}
                disabled={editProjectMutation.isPending}
              />

              <FeatureSetting
                title="Campaign Tracking"
                description="Track UTM source, medium and campaign values."
                checked={form.values.settings.campaign}
                onChange={(v) => toggleSetting("campaign", v)}
                disabled={editProjectMutation.isPending}
              />

              <FeatureSetting
                title="Click Tracking"
                description="Track CTA clicks and interactions."
                checked={form.values.settings.clicks}
                onChange={(v) => toggleSetting("clicks", v)}
                disabled={editProjectMutation.isPending}
              />
            </Stack>
          </div>

          {editProjectMutation.error && (
            <ErrorBanner error={editProjectMutation.error} />
          )}

          <Group justify="flex-end">
            <Button variant="default" onClick={() => close()}>
              Cancel
            </Button>

            <Button
              type="submit"
              loading={editProjectMutation.isPending}
              disabled={!form.isDirty()}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

function FeatureSetting({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap">
      <div>
        <Text fw={500} size="sm">
          {title}
        </Text>

        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </div>

      <Switch
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
        disabled={disabled}
      />
    </Group>
  );
}
