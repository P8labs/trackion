import {
  Button,
  Card,
  Container,
  Group,
  List,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { ArrowRightIcon, BarChart3, Code, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "./components/Footer";
import DemoSection from "./components/DemoSection";
import { Header } from "./components/Header";

export function LandingPage() {
  return (
    <Container className="relative select-text!" size="lg" px={0}>
      <div className="absolute inset-0 overflow-hidden z-[-1]">
        <Dots
          className="absolute text-(--mantine-color-gray-1) dark:text-(--mantine-color-dark-5) max-sm:hidden"
          style={{ left: 0, top: 0 }}
        />
        <Dots
          className="absolute text-(--mantine-color-gray-1) dark:text-(--mantine-color-dark-5) max-sm:hidden"
          style={{ left: 60, top: 0 }}
        />
        <Dots
          className="absolute text-(--mantine-color-gray-1) dark:text-(--mantine-color-dark-5) max-sm:hidden"
          style={{ left: 0, top: 140 }}
        />
        <Dots
          className="absolute text-(--mantine-color-gray-1) dark:text-(--mantine-color-dark-5) max-sm:hidden"
          style={{ right: 0, top: 60 }}
        />
      </div>

      <Header />
      <Stack gap={80} py={80}>
        <Stack align="center" gap="xl">
          <Title
            ta="center"
            maw={900}
            style={{
              fontSize: "clamp(3rem, 8vw, 5rem)",
              lineHeight: 1.1,
            }}
          >
            Love your product telemetry again
          </Title>

          <Text size="lg" c="dimmed" ta="center" maw={700}>
            Trackion delivers session insights, custom events, and reliable
            observability in one clean workflow. Start in cloud beta, then move
            to self-hosting when you are ready to scale with full control.
          </Text>

          <Group>
            <Button component={Link} to="/auth" size="lg">
              Start Free
            </Button>

            <Button component="a" href="/docs/" variant="default" size="lg">
              Read Docs
            </Button>
          </Group>
        </Stack>

        {/* <DemoSection /> */}

        <Stack gap="xl">
          <Title order={2} ta="center">
            Features
          </Title>

          <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }}>
            {featureCards.map((feature) => (
              <Card key={feature.title} withBorder padding="lg" radius="md">
                <Stack gap="sm">
                  <ThemeIcon variant="light" size="xl">
                    {feature.icon}
                  </ThemeIcon>

                  <Title order={4}>{feature.title}</Title>

                  <Text size="sm" c="dimmed">
                    {feature.description}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>

        <Stack gap="xl">
          <Title order={2} ta="center">
            Pricing
          </Title>

          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Card withBorder p="xl">
              <Stack>
                <Text fw={700}>Free</Text>

                <Title order={2}>
                  $0
                  <Text span size="sm" c="dimmed">
                    {" "}
                    /month
                  </Text>
                </Title>

                <List spacing="xs">
                  <List.Item>10,000 events / month</List.Item>
                  <List.Item>3 projects</List.Item>
                  <List.Item>10 config keys</List.Item>
                  <List.Item>Error retention: 3 days</List.Item>
                </List>

                <Button>Get Started</Button>
              </Stack>
            </Card>

            <Card withBorder p="xl">
              <Stack>
                <Text fw={700}>Pro</Text>

                <Title order={2}>
                  $9
                  <Text span size="sm" c="dimmed">
                    {" "}
                    /month
                  </Text>
                </Title>

                <List spacing="xs">
                  <List.Item>100,000 events / month</List.Item>
                  <List.Item>10 projects</List.Item>
                  <List.Item>100 config keys</List.Item>
                  <List.Item>Error retention: 30 days</List.Item>
                </List>

                <Button>Get Started</Button>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>

        <Paper withBorder p="xl" radius="lg">
          <Stack align="center" gap="md">
            <Text size="xs" tt="uppercase" c="dimmed" fw={700}>
              Ready To Ship
            </Text>

            <Title ta="center" maw={800}>
              Build telemetry your team will actually use
            </Title>

            <Text c="dimmed" ta="center" maw={650}>
              Trackion keeps the setup simple, the data useful, and the
              deployment path flexible from day one.
            </Text>

            <Group mt="md">
              <Button
                component={Link}
                to="/auth"
                size="lg"
                rightSection={<ArrowRightIcon size={16} />}
              >
                Create Free Project
              </Button>

              <Button
                component="a"
                href="/docs/quick-start/"
                target="_blank"
                variant="default"
                size="lg"
              >
                Quick Start Guide
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Footer />
      </Stack>
    </Container>
  );
}

const featureCards = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: "2-Minute Setup",
    description:
      "Drop a single script tag and start collecting product signals immediately.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Live Dashboards",
    description:
      "Watch sessions, funnels, and page behavior update in real time.",
  },
  {
    icon: <Code className="h-5 w-5" />,
    title: "Custom Events API",
    description:
      "Instrument any backend or frontend action with language-agnostic calls.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Privacy by Design",
    description:
      "Self-hosted mode gives full data ownership with no third-party dependency.",
  },
];

export interface DotsProps extends React.ComponentPropsWithoutRef<"svg"> {
  size?: number;
  radius?: number;
}

export function Dots({ size = 185, radius = 2.5, ...others }: DotsProps) {
  return (
    <svg
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 185 185"
      width={size}
      height={size}
      {...others}
    >
      <rect width="5" height="5" rx={radius} />
      <rect width="5" height="5" x="60" rx={radius} />
      <rect width="5" height="5" x="120" rx={radius} />
      <rect width="5" height="5" x="20" rx={radius} />
      <rect width="5" height="5" x="80" rx={radius} />
      <rect width="5" height="5" x="140" rx={radius} />
      <rect width="5" height="5" x="40" rx={radius} />
      <rect width="5" height="5" x="100" rx={radius} />
      <rect width="5" height="5" x="160" rx={radius} />
      <rect width="5" height="5" x="180" rx={radius} />
      <rect width="5" height="5" y="20" rx={radius} />
      <rect width="5" height="5" x="60" y="20" rx={radius} />
      <rect width="5" height="5" x="120" y="20" rx={radius} />
      <rect width="5" height="5" x="20" y="20" rx={radius} />
      <rect width="5" height="5" x="80" y="20" rx={radius} />
      <rect width="5" height="5" x="140" y="20" rx={radius} />
      <rect width="5" height="5" x="40" y="20" rx={radius} />
      <rect width="5" height="5" x="100" y="20" rx={radius} />
      <rect width="5" height="5" x="160" y="20" rx={radius} />
      <rect width="5" height="5" x="180" y="20" rx={radius} />
      <rect width="5" height="5" y="40" rx={radius} />
      <rect width="5" height="5" x="60" y="40" rx={radius} />
      <rect width="5" height="5" x="120" y="40" rx={radius} />
      <rect width="5" height="5" x="20" y="40" rx={radius} />
      <rect width="5" height="5" x="80" y="40" rx={radius} />
      <rect width="5" height="5" x="140" y="40" rx={radius} />
      <rect width="5" height="5" x="40" y="40" rx={radius} />
      <rect width="5" height="5" x="100" y="40" rx={radius} />
      <rect width="5" height="5" x="160" y="40" rx={radius} />
      <rect width="5" height="5" x="180" y="40" rx={radius} />
      <rect width="5" height="5" y="60" rx={radius} />
      <rect width="5" height="5" x="60" y="60" rx={radius} />
      <rect width="5" height="5" x="120" y="60" rx={radius} />
      <rect width="5" height="5" x="20" y="60" rx={radius} />
      <rect width="5" height="5" x="80" y="60" rx={radius} />
      <rect width="5" height="5" x="140" y="60" rx={radius} />
      <rect width="5" height="5" x="40" y="60" rx={radius} />
      <rect width="5" height="5" x="100" y="60" rx={radius} />
      <rect width="5" height="5" x="160" y="60" rx={radius} />
      <rect width="5" height="5" x="180" y="60" rx={radius} />
      <rect width="5" height="5" y="80" rx={radius} />
      <rect width="5" height="5" x="60" y="80" rx={radius} />
      <rect width="5" height="5" x="120" y="80" rx={radius} />
      <rect width="5" height="5" x="20" y="80" rx={radius} />
      <rect width="5" height="5" x="80" y="80" rx={radius} />
      <rect width="5" height="5" x="140" y="80" rx={radius} />
      <rect width="5" height="5" x="40" y="80" rx={radius} />
      <rect width="5" height="5" x="100" y="80" rx={radius} />
      <rect width="5" height="5" x="160" y="80" rx={radius} />
      <rect width="5" height="5" x="180" y="80" rx={radius} />
      <rect width="5" height="5" y="100" rx={radius} />
      <rect width="5" height="5" x="60" y="100" rx={radius} />
      <rect width="5" height="5" x="120" y="100" rx={radius} />
      <rect width="5" height="5" x="20" y="100" rx={radius} />
      <rect width="5" height="5" x="80" y="100" rx={radius} />
      <rect width="5" height="5" x="140" y="100" rx={radius} />
      <rect width="5" height="5" x="40" y="100" rx={radius} />
      <rect width="5" height="5" x="100" y="100" rx={radius} />
      <rect width="5" height="5" x="160" y="100" rx={radius} />
      <rect width="5" height="5" x="180" y="100" rx={radius} />
      <rect width="5" height="5" y="120" rx={radius} />
      <rect width="5" height="5" x="60" y="120" rx={radius} />
      <rect width="5" height="5" x="120" y="120" rx={radius} />
      <rect width="5" height="5" x="20" y="120" rx={radius} />
      <rect width="5" height="5" x="80" y="120" rx={radius} />
      <rect width="5" height="5" x="140" y="120" rx={radius} />
      <rect width="5" height="5" x="40" y="120" rx={radius} />
      <rect width="5" height="5" x="100" y="120" rx={radius} />
      <rect width="5" height="5" x="160" y="120" rx={radius} />
      <rect width="5" height="5" x="180" y="120" rx={radius} />
      <rect width="5" height="5" y="140" rx={radius} />
      <rect width="5" height="5" x="60" y="140" rx={radius} />
      <rect width="5" height="5" x="120" y="140" rx={radius} />
      <rect width="5" height="5" x="20" y="140" rx={radius} />
      <rect width="5" height="5" x="80" y="140" rx={radius} />
      <rect width="5" height="5" x="140" y="140" rx={radius} />
      <rect width="5" height="5" x="40" y="140" rx={radius} />
      <rect width="5" height="5" x="100" y="140" rx={radius} />
      <rect width="5" height="5" x="160" y="140" rx={radius} />
      <rect width="5" height="5" x="180" y="140" rx={radius} />
      <rect width="5" height="5" y="160" rx={radius} />
      <rect width="5" height="5" x="60" y="160" rx={radius} />
      <rect width="5" height="5" x="120" y="160" rx={radius} />
      <rect width="5" height="5" x="20" y="160" rx={radius} />
      <rect width="5" height="5" x="80" y="160" rx={radius} />
      <rect width="5" height="5" x="140" y="160" rx={radius} />
      <rect width="5" height="5" x="40" y="160" rx={radius} />
      <rect width="5" height="5" x="100" y="160" rx={radius} />
      <rect width="5" height="5" x="160" y="160" rx={radius} />
      <rect width="5" height="5" x="180" y="160" rx={radius} />
      <rect width="5" height="5" y="180" rx={radius} />
      <rect width="5" height="5" x="60" y="180" rx={radius} />
      <rect width="5" height="5" x="120" y="180" rx={radius} />
      <rect width="5" height="5" x="20" y="180" rx={radius} />
      <rect width="5" height="5" x="80" y="180" rx={radius} />
      <rect width="5" height="5" x="140" y="180" rx={radius} />
      <rect width="5" height="5" x="40" y="180" rx={radius} />
      <rect width="5" height="5" x="100" y="180" rx={radius} />
      <rect width="5" height="5" x="160" y="180" rx={radius} />
      <rect width="5" height="5" x="180" y="180" rx={radius} />
    </svg>
  );
}
