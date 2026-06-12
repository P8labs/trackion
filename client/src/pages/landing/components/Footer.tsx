import {
  Anchor,
  Box,
  Divider,
  Grid,
  Group,
  Image,
  Stack,
  Text,
} from "@mantine/core";
import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Documentation", href: "/docs/" },
      { label: "Downloads", href: "/downloads", internal: true },
      {
        label: "GitHub",
        href: "https://github.com/P8labs/trackion",
      },
      { label: "Dashboard", href: "/auth", internal: true },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Quick Start", href: "/docs/quick-start/" },
      { label: "API Reference", href: "/docs/api-reference/" },
      { label: "Self-hosting", href: "/docs/self-hosting/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about", internal: true },
      { label: "P8labs", href: "https://p8labs.in" },
      { label: "Contact", href: "mailto:hello@p8labs.in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms", internal: true },
      { label: "Privacy", href: "/privacy", internal: true },
    ],
  },
];

export function Footer() {
  return (
    <Box component="footer" py={80} className="px-4">
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Group gap="xs">
              <Image src="/trackion_t.png" alt="Trackion" w={28} h={28} />

              <Text fw={600}>Trackion</Text>
            </Group>

            <Text size="sm" c="dimmed" maw={280}>
              Lightweight telemetry infrastructure built for developers who care
              about speed and clarity.
            </Text>
          </Stack>
        </Grid.Col>

        {footerColumns.map((column) => (
          <Grid.Col key={column.title} span={{ base: 6, md: 2 }}>
            <Stack gap="xs">
              <Text size="xs" tt="uppercase" c="dimmed" fw={700}>
                {column.title}
              </Text>

              {column.links.map((link) =>
                link.internal ? (
                  <Anchor
                    key={link.label}
                    component={Link}
                    to={link.href}
                    c="dimmed"
                  >
                    {link.label}
                  </Anchor>
                ) : (
                  <Anchor
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    c="dimmed"
                  >
                    {link.label}
                  </Anchor>
                ),
              )}
            </Stack>
          </Grid.Col>
        ))}
      </Grid>

      <Divider my="xl" />

      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          © {new Date().getFullYear()} Trackion. Built at{" "}
          <Anchor href="https://p8labs.in?utm=trackion" target="_blank">
            P8labs
          </Anchor>
        </Text>

        <Text size="xs" c="dimmed">
          Open Source
        </Text>
      </Group>
    </Box>
  );
}
