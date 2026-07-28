import {
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { ArrowRightIcon, BarChart3, Code, Shield, Zap } from "lucide-react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import DemoSection from "./components/DemoSection";

export function LandingPage() {
  return (
    <Container className="relative select-text!" size="lg" px={0}>
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
            Open-source telemetry that stays under your control
          </Title>

          <Text size="lg" c="dimmed" ta="center" maw={760}>
            Trackion is a lightweight telemetry platform for developers. Capture
            events, monitor your application, and understand product usage with
            a simple, self-hosted solution without vendor lock-in or expensive
            SaaS pricing.
          </Text>
          <Group>
            <Button
              component="a"
              href="https://github.com/P8labs/trackion"
              target="_blank"
              size="lg"
              rightSection={<ArrowRightIcon size={16} />}
            >
              Get Started
            </Button>

            <Button
              component="a"
              href="/docs/quick-start/"
              variant="default"
              size="lg"
            >
              Quick Start
            </Button>
          </Group>
        </Stack>

        <DemoSection />

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
            Open Source
          </Title>

          <Card withBorder p="xl" radius="md">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} variant="light" radius="xl">
                <Code className="h-8 w-8" />
              </ThemeIcon>

              <Title ta="center">Free forever. Self-hosted by default.</Title>

              <Text ta="center" maw={700} c="dimmed">
                Trackion is completely open source. Deploy it on your own
                infrastructure, own your telemetry data, and customize it
                however you like. No subscriptions, no vendor lock-in, and no
                usage limits imposed by us.
              </Text>

              <Group mt="sm">
                <Button
                  component="a"
                  href="https://github.com/your-org/trackion"
                  target="_blank"
                  size="lg"
                >
                  View on GitHub
                </Button>

                <Button
                  component="a"
                  href="/docs/quick-start/"
                  variant="default"
                  size="lg"
                >
                  Quick Start
                </Button>
              </Group>
            </Stack>
          </Card>
        </Stack>

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
