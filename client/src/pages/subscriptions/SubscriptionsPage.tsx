import { useMemo } from "react";

import moment from "moment";
import { userHooks } from "@/hooks/queries/use-user";
import { ErrorBanner } from "@/components/core/error-banner";
import { LoadingView } from "@/Loader";
import {
  Paper,
  Text,
  Progress,
  SimpleGrid,
  Group,
  Divider,
  Badge,
} from "@mantine/core";
import { Columns3CogIcon, FolderIcon, TrendingUpIcon } from "lucide-react";

const formatTimeLeft = (endDate: Date | string) => {
  const now = moment();
  const end = moment(new Date(endDate));

  if (end.isBefore(now)) return "0 days";

  const years = end.diff(now, "years");
  now.add(years, "years");
  const months = end.diff(now, "months");
  now.add(months, "months");
  const days = end.diff(now, "days");

  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);

  if (parts.length === 0) return "Less than a day";
  return parts.join(" ");
};

export function SubscriptionsPage() {
  const { data: usage, isLoading, error } = userHooks.useUsage();

  const eventPercent = useMemo(() => {
    if (!usage || usage.events_limit <= 0) {
      return 0; // -1 (Unlimited) or 0 will return 0 safely
    }
    return Math.min((usage.events_used / usage.events_limit) * 100, 100);
  }, [usage]);

  if (isLoading) {
    return <LoadingView />;
  }

  if (error || !usage) {
    return <ErrorBanner label="Unable to load usage details." error={error} />;
  }

  const periodEndLabel = moment(new Date(usage.current_period_end)).format(
    "MM/DD/YYYY",
  );
  const lastResetLabel = moment(new Date(usage.last_usage_reset)).format(
    "MM/DD/YYYY",
  );

  const timeLeftString = formatTimeLeft(usage.current_period_end);

  const isEventsUnlimited = usage.events_limit === -1;
  const isProjectsUnlimited = usage.projects_limit === -1;
  const isConfigsUnlimited =
    usage.config_keys_limit === -1 || usage.config_unlimited;

  return (
    <section className="mx-auto h-full">
      <Paper radius="xs" className="overflow-hidden">
        <div className="p-5 md:p-6 bg-muted/30">
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Plan
              </Text>
              <Badge mt="xs" variant="light" size="lg" className="capitalize">
                {usage.plan}
              </Badge>
            </div>
            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Status
              </Text>
              <Badge
                mt="xs"
                color={usage.status === "active" ? "green" : "gray"}
                variant="dot"
                size="lg"
                className="capitalize"
              >
                {usage.status}
              </Badge>
            </div>
            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Period Ends
              </Text>
              <Text mt="xs" size="sm" fw={500}>
                {periodEndLabel}
              </Text>
            </div>
            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Last Reset
              </Text>
              <Text mt="xs" size="sm" fw={500}>
                {lastResetLabel}
              </Text>
            </div>
          </SimpleGrid>
          <Text mt="md" size="xs" c="dimmed">
            Current billing window has{" "}
            <Text component="span" fw={600} c="foreground">
              {timeLeftString}
            </Text>{" "}
            remaining.
          </Text>
        </div>

        <Divider />

        <div className="p-5 md:p-6">
          <Group justify="space-between" mb="xs">
            <Group gap="sm" c="dimmed">
              <TrendingUpIcon size={18} />
              <Text size="sm" fw={500}>
                Events
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {usage.events_used.toLocaleString()} /{" "}
              {isEventsUnlimited
                ? "Unlimited"
                : usage.events_limit.toLocaleString()}
            </Text>
          </Group>

          {!isEventsUnlimited && (
            <Progress
              value={eventPercent}
              size="md"
              radius="xl"
              color={eventPercent > 90 ? "red" : "blue"}
            />
          )}

          <Group justify="space-between" mt="xs">
            <Text size="xs" c="dimmed">
              {isEventsUnlimited
                ? "Unlimited plan"
                : `Used ${eventPercent.toFixed(1)}%`}
            </Text>
            <Text size="xs" c="dimmed">
              {isEventsUnlimited
                ? "No event cap"
                : `${usage.events_remaining.toLocaleString()} remaining`}
            </Text>
          </Group>
        </div>

        <Divider />

        <div className="p-5 md:p-6">
          <Group justify="space-between" mb="xs">
            <Group gap="sm" c="dimmed">
              <FolderIcon size={18} />
              <Text size="sm" fw={500}>
                Projects
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {usage.projects_used} /{" "}
              {isProjectsUnlimited ? "Unlimited" : usage.projects_limit}
            </Text>
          </Group>

          {!isProjectsUnlimited && (
            <Progress
              value={usage.projects_used_percent}
              size="md"
              radius="xl"
              color={usage.projects_used_percent > 90 ? "red" : "blue"}
            />
          )}

          <Group justify="space-between" mt="xs">
            <Text size="xs" c="dimmed">
              {isProjectsUnlimited
                ? "Unlimited plan"
                : `Used ${usage.projects_used_percent.toFixed(1)}%`}
            </Text>
            <Text size="xs" c="dimmed">
              {isProjectsUnlimited
                ? "No project cap"
                : `${usage.projects_remaining} slots remaining`}
            </Text>
          </Group>
        </div>

        <Divider />

        <div className="p-5 md:p-6">
          <Group justify="space-between" mb="xs">
            <Group gap="sm" c="dimmed">
              <Columns3CogIcon size={18} />
              <Text size="sm" fw={500}>
                Remote Config Keys
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {usage.configs_used} /{" "}
              {isConfigsUnlimited ? "Unlimited" : usage.config_keys_limit}
            </Text>
          </Group>

          {!isConfigsUnlimited && (
            <Progress
              value={usage.config_keys_used_percent}
              size="md"
              radius="xl"
              color={usage.config_keys_used_percent > 90 ? "red" : "blue"}
            />
          )}

          <Group justify="space-between" mt="xs">
            <Text size="xs" c="dimmed">
              {isConfigsUnlimited
                ? "Unlimited plan"
                : `Used ${usage.config_keys_used_percent.toFixed(1)}%`}
            </Text>
            <Text size="xs" c="dimmed">
              {isConfigsUnlimited
                ? "No key cap"
                : `${usage.config_keys_remaining} keys remaining`}
            </Text>
          </Group>
        </div>

        <Divider />

        <div className="p-5 md:p-6">
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Feature Flags
              </Text>
              <Text mt="xs" size="sm" fw={500}>
                {usage.feature_flags_used} active
              </Text>
            </div>
            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Error Retention
              </Text>
              <Text mt="xs" size="sm" fw={500}>
                {usage.error_retention_days === -1
                  ? "Unlimited"
                  : `${usage.error_retention_days} days`}
              </Text>
            </div>
            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Rollout Support
              </Text>
              <Text
                mt="xs"
                size="sm"
                fw={500}
                c={usage.supports_rollout ? "green" : "dimmed"}
              >
                {usage.supports_rollout ? "Enabled" : "Not available"}
              </Text>
            </div>
          </SimpleGrid>
        </div>
      </Paper>
    </section>
  );
}
