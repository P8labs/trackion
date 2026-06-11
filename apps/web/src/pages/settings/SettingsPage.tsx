import moment from "moment";
import { WEB_VERSION } from "@/lib/constants";
import { userHooks } from "@/hooks/queries/use-user";
import {
  Paper,
  Text,
  Avatar,
  Group,
  Divider,
  SimpleGrid,
  Badge,
  Anchor,
} from "@mantine/core";
import { useGlobalStore } from "@/store";
import DeviceInfo from "./components/DeviceInfo";
import Updater from "./components/Updater";

export function SettingsPage() {
  const currentUser = useGlobalStore((state) => state.user);

  const {
    data: health,
    isLoading: healthLoading,
    isError: healthError,
  } = userHooks.useServerHealth();

  const userInitials = (currentUser?.name || currentUser?.email || "TR")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <section>
      <Paper className="overflow-hidden">
        <div className="p-5 md:p-6">
          <Text size="sm" fw={600} mb="md">
            Profile
          </Text>

          {currentUser ? (
            <Group wrap="nowrap" gap="lg">
              <Avatar
                src={currentUser.avatar_url}
                size="xl"
                radius="md"
                color="blue"
              >
                {userInitials || "TR"}
              </Avatar>

              <div>
                <Text fw={600} size="lg">
                  {currentUser.name || "Trackion User"}
                </Text>
                <Text c="dimmed" size="sm">
                  {currentUser.email || "No email"}
                </Text>

                <Text size="xs" c="dimmed" mt="sm">
                  Joined {moment(currentUser.created_at).fromNow()}
                </Text>
              </div>
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              No profile available for this mode.
            </Text>
          )}
        </div>

        <Divider />

        <div className="p-5 md:p-6">
          <Text size="sm" fw={600} mb="md">
            System
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Server Status
              </Text>
              <Group gap="xs" mt="xs">
                <Badge
                  color={healthError ? "red" : "green"}
                  variant="dot"
                  size="lg"
                >
                  {healthLoading
                    ? "Checking..."
                    : healthError
                      ? "Down"
                      : "Operational"}
                </Badge>
              </Group>
            </div>

            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Server Version
              </Text>
              <Text mt="xs" size="sm" fw={500}>
                {health?.server_version || "Unknown"}
              </Text>
            </div>

            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Web Version
              </Text>
              <Text mt="xs" size="sm" fw={500}>
                {WEB_VERSION}
              </Text>
            </div>
          </SimpleGrid>
        </div>

        <Divider />
        <DeviceInfo />

        <Divider />
        <Updater />
        <Divider />

        <div className="p-5 md:p-6">
          <Text size="sm" fw={600} mb="xs">
            Data & Privacy
          </Text>
          <Text size="sm" c="dimmed" maw={600} lh={1.6}>
            All tracking data is stored on your server if using the self-hosted
            version. On deletion of projects or events, data will be deleted
            permanently and cannot be recovered.
          </Text>
        </div>

        <Divider />

        <div className="p-5 md:p-6 bg-muted/10">
          <Text size="sm" fw={600} mb="md">
            Resources
          </Text>
          <Group justify="space-between" align="flex-end">
            <Group gap="lg">
              <Anchor
                href="/docs/"
                target="_blank"
                size="sm"
                c="dimmed"
                className="hover:text-foreground transition-colors"
              >
                Documentation
              </Anchor>
              <Anchor
                href="/docs/quick-start/"
                target="_blank"
                size="sm"
                c="dimmed"
                className="hover:text-foreground transition-colors"
              >
                Quick Start
              </Anchor>
              <Anchor
                href="/terms"
                size="sm"
                c="dimmed"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Anchor>
              <Anchor
                href="/privacy"
                size="sm"
                c="dimmed"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Anchor>
            </Group>

            <Text size="xs" c="dimmed" mt={{ base: "md", sm: 0 }}>
              © {new Date().getFullYear()} Trackion. Built at P8labs.
            </Text>
          </Group>
        </div>
      </Paper>
    </section>
  );
}
