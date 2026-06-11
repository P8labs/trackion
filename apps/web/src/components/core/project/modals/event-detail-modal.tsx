import { useMemo } from "react";
import moment from "moment";

import {
  Badge,
  Code,
  Divider,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";

import type { RecentEventData } from "@trackion/lib/types";
import { useMediaQuery } from "@mantine/hooks";
import { CodeHighlight } from "@mantine/code-highlight";

interface EventDetailsModalProps {
  event: RecentEventData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsModal({
  event,
  open,
  onOpenChange,
}: EventDetailsModalProps) {
  const mobile = useMediaQuery("(max-width: 768px)");

  const properties = useMemo(() => {
    if (!event?.properties) {
      return {};
    }

    try {
      const parsed =
        typeof event.properties === "string"
          ? JSON.parse(event.properties)
          : event.properties;

      return typeof parsed === "object" && parsed ? parsed : {};
    } catch {
      return {};
    }
  }, [event?.properties]);

  if (!event) {
    return null;
  }

  return (
    <Modal
      opened={open}
      onClose={() => onOpenChange(false)}
      size="xl"
      fullScreen={mobile}
      title={
        <Group gap="sm">
          <Badge variant="gradient" color={getEventColor(event.event_name)}>
            {event.event_name}
          </Badge>

          <Text size="sm" c="dimmed">
            {moment(event.created_at).format("MMM D, YYYY h:mm:ss A")}
          </Text>

          <Code>#{event.id}</Code>
        </Group>
      }
    >
      <ScrollArea.Autosize>
        <Stack gap={0}>
          <Section title="Event">
            {event.event_type && <Row label="Type">{event.event_type}</Row>}

            {event.user_id && (
              <Row label="User ID">
                <Code>{event.user_id}</Code>
              </Row>
            )}
          </Section>

          <Divider />

          <Section title="Session">
            <Row label="Session ID">
              <Code>{event.session_id}</Code>
            </Row>

            <Row label="Timestamp">
              {moment(event.created_at).format("YYYY-MM-DD HH:mm:ss.SSS")}
            </Row>
          </Section>

          {(event.page_path || event.page_title || event.referrer) && (
            <>
              <Divider />

              <Section title="Page">
                {event.page_title && (
                  <Row label="Title">{event.page_title}</Row>
                )}

                {event.page_path && (
                  <Row label="Path">
                    <Code>{event.page_path}</Code>
                  </Row>
                )}

                {event.referrer && event.referrer !== "Direct" && (
                  <Row label="Referrer">
                    <Text
                      component="a"
                      href={event.referrer}
                      target="_blank"
                      c="cyan"
                    >
                      {event.referrer}
                    </Text>
                  </Row>
                )}
              </Section>
            </>
          )}

          {(event.platform ||
            event.device ||
            event.browser ||
            event.os_version ||
            event.app_version) && (
            <>
              <Divider />

              <Section title="Device">
                {event.platform && <Row label="Platform">{event.platform}</Row>}

                {event.device && <Row label="Device">{event.device}</Row>}

                {event.browser && <Row label="Browser">{event.browser}</Row>}

                {event.os_version && (
                  <Row label="OS Version">{event.os_version}</Row>
                )}

                {event.app_version && (
                  <Row label="App Version">{event.app_version}</Row>
                )}
              </Section>
            </>
          )}

          {(event.utm_source || event.utm_medium || event.utm_campaign) && (
            <>
              <Divider />

              <Section title="UTM">
                {event.utm_source && (
                  <Row label="Source">{event.utm_source}</Row>
                )}

                {event.utm_medium && (
                  <Row label="Medium">{event.utm_medium}</Row>
                )}

                {event.utm_campaign && (
                  <Row label="Campaign">{event.utm_campaign}</Row>
                )}
              </Section>
            </>
          )}

          {Object.keys(properties).length > 0 && (
            <>
              <Divider />

              <Section title="Properties">
                {Object.entries(properties).map(([key, value]) => (
                  <Row key={key} label={key}>
                    <Code block>
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </Code>
                  </Row>
                ))}
              </Section>
            </>
          )}

          <Divider />

          <Section title="Raw Event">
            <CodeHighlight
              code={JSON.stringify(event, null, 2)}
              language="json"
            />
          </Section>
        </Stack>
      </ScrollArea.Autosize>
    </Modal>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap="sm" py="md">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase">
        {title}
      </Text>

      {children}
    </Stack>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Group align="flex-start" wrap="wrap">
      <Text size="sm" c="dimmed" w={140}>
        {label}
      </Text>

      <div style={{ flex: 1 }}>{children}</div>
    </Group>
  );
}

function getEventColor(eventName: string): string {
  switch (eventName) {
    case "page.view":
      return "green";

    case "page.click":
      return "red";

    case "page.time_spent":
      return "yellow";

    default:
      return "blue";
  }
}
