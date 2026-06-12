import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";

import { PublicPageLayout } from "./components/PublicPageLayout";
import { FaGithub } from "react-icons/fa";

export function AboutPage() {
  return (
    <PublicPageLayout>
      <Stack gap={80}>
        <Stack align="center" ta="center" py="xl">
          <Title order={1} size="3.5rem">
            Trackion
          </Title>

          <Text size="xl" c="dimmed" maw={700}>
            Telemetry infrastructure that doesn't fight you. No bloat. No
            lock-in.
            <br />
            Just events, data, and control.
          </Text>
        </Stack>

        <Stack gap="lg">
          <Title order={2}>Why this exists</Title>

          <Text c="dimmed">
            Most analytics tools are either too heavy, too expensive, or too
            opaque. You ship a simple product and suddenly you're dealing with
            dashboards you don't trust and data you don't control.
          </Text>

          <Text c="dimmed">
            Trackion was built to fix that. It gives you the core primitives:
            events, sessions, and insights — without forcing a platform on you.
          </Text>

          <Text fw={600}>
            If you can send an event, you can understand your system.
          </Text>
        </Stack>

        <Stack gap="lg">
          <Title order={2}>Built by P8labs</Title>

          <Text c="dimmed">
            Trackion is built by{" "}
            <Text span fw={600} c="inherit">
              P8labs Team
            </Text>
            .
          </Text>

          <Text c="dimmed">
            P8labs focuses on building small, sharp developer tools — things
            that solve real problems without turning into platforms.
          </Text>

          <Text c="dimmed">
            This project started from a simple frustration:
            <Text span c="inherit" fw={500}>
              {" "}
              tracking events shouldn't require a full ecosystem.
            </Text>
          </Text>
        </Stack>

        <Stack gap="lg">
          <Title order={2}>Open source first</Title>

          <Text c="dimmed">
            Trackion is MIT licensed. You can read the code, modify it, fork it,
            or run it however you want.
          </Text>

          <Text c="dimmed">No hidden logic. No black boxes.</Text>

          <Group>
            <Button
              component="a"
              href="https://github.com/P8labs/trackion"
              target="_blank"
              variant="default"
              leftSection={<FaGithub size={16} />}
            >
              View on GitHub
            </Button>
          </Group>
        </Stack>

        <Stack gap="lg">
          <Title order={2}>What's next</Title>

          <Stack gap="xs">
            <Text c="dimmed">
              • Better dashboards (less noise, more signal)
            </Text>

            <Text c="dimmed">• Workflow / pipeline tracking</Text>

            <Text c="dimmed">• More flexible auth models</Text>

            <Text c="dimmed">• Stronger API surface</Text>
          </Stack>
        </Stack>

        <Paper withBorder radius="xl" p="xl">
          <Stack align="center" ta="center" gap="lg">
            <Title order={2}>Try it yourself</Title>

            <Text c="dimmed">
              Run it locally, or use the cloud version (currently in beta).
            </Text>

            <Group>
              <Button
                component="a"
                href="/docs/"
                target="_blank"
                variant="default"
              >
                Read Docs
              </Button>

              <Button component={Link} to="/auth">
                Open Dashboard
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </PublicPageLayout>
  );
}
