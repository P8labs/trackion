import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { projectHooks } from "@/hooks/queries/use-project";
import { LoadingView } from "@/Loader";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Center,
  Code,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";

export function ErrorDetailPage() {
  const { fingerprint = "", id: projectId = "" } = useParams<{
    fingerprint: string;
    id: string;
  }>();

  const navigate = useNavigate();

  const { data: occurrences, isLoading } = projectHooks.useErrorDetail(
    projectId,
    fingerprint,
  );

  const handleBack = () => {
    navigate(`/projects/${projectId}/errors`);
  };

  const formatStackTrace = (stackTrace: string) => {
    if (!stackTrace) return "No stack trace available";

    return stackTrace;
  };

  const firstOccurrence = occurrences?.[0];
  const uniqueUsers = new Set(
    (occurrences || []).filter((o) => o.user_id).map((o) => o.user_id),
  ).size;

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <div>
      <Stack gap={4} mb="xl" px="lg" pt="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={600} size="xl">
              Error Details
            </Text>

            <Text size="sm" c="dimmed">
              Inspect error occurrences, stack traces and context.
            </Text>
          </div>

          <Button
            variant="default"
            leftSection={<ArrowLeft size={14} />}
            onClick={handleBack}
          >
            Back
          </Button>
        </Group>

        {firstOccurrence?.message && (
          <Code
            block
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {firstOccurrence.message}
          </Code>
        )}
      </Stack>

      {!occurrences || occurrences.length === 0 ? (
        <Center py={80}>
          <Stack align="center" gap="xs">
            <ThemeIcon variant="light" color="red" size={48} radius="xl">
              <AlertCircle size={22} />
            </ThemeIcon>

            <Text fw={600}>No occurrences found</Text>

            <Text size="sm" c="dimmed">
              This error fingerprint has no recorded occurrences.
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap={0}>
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing={0}>
            <Box p="md">
              <Text size="xs" c="dimmed" tt="uppercase">
                Total
              </Text>
              <Text fw={700} size="xl">
                {occurrences.length}
              </Text>
            </Box>

            <Box p="md">
              <Text size="xs" c="dimmed" tt="uppercase">
                Last Seen
              </Text>
              <Text size="sm">
                {moment(occurrences[0].timestamp).format("YYYY-MM-DD HH:mm:ss")}
              </Text>
            </Box>

            <Box p="md">
              <Text size="xs" c="dimmed" tt="uppercase">
                Affected Users
              </Text>
              <Text fw={700} size="xl">
                {uniqueUsers}
              </Text>
            </Box>

            <Box p="md">
              <Text size="xs" c="dimmed" tt="uppercase">
                Browser
              </Text>
              <Text size="sm" truncate>
                {firstOccurrence?.browser || "Unknown"}
              </Text>
            </Box>
          </SimpleGrid>

          <Divider />

          <Box p="md">
            <Text size="xs" c="dimmed" tt="uppercase" mb="xs">
              Fingerprint
            </Text>

            <Group gap="xs" wrap="nowrap">
              <CodeHighlight className="w-full" code={fingerprint} />
            </Group>
          </Box>

          <Divider />

          <Box p="md">
            <Text size="xs" c="dimmed" tt="uppercase" mb="sm">
              Stack Trace
            </Text>

            <CodeHighlight
              code={formatStackTrace(firstOccurrence?.stack_trace || "")}
            />
          </Box>

          <Divider />

          <Box p="md">
            <Text size="xs" c="dimmed" tt="uppercase" mb="md">
              Recent Occurrences
            </Text>

            <Stack gap="xs">
              {occurrences.slice(0, 10).map((occurrence) => (
                <Box key={occurrence.id}>
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={2} flex={1}>
                      <Anchor
                        href={occurrence.url}
                        target="_blank"
                        size="sm"
                        truncate
                      >
                        {occurrence.url || "-"}
                      </Anchor>

                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          {moment(occurrence.timestamp).format(
                            "YYYY-MM-DD HH:mm:ss",
                          )}
                        </Text>

                        <Badge variant="default" size="xs">
                          {occurrence.browser || "Unknown"}
                        </Badge>

                        <Badge variant="default" size="xs">
                          {occurrence.platform || "Unknown"}
                        </Badge>
                      </Group>
                    </Stack>

                    {occurrence.user_id ? (
                      <Badge variant="light">{occurrence.user_id}</Badge>
                    ) : (
                      <Text size="xs" c="dimmed">
                        Anonymous
                      </Text>
                    )}
                  </Group>
                </Box>
              ))}
            </Stack>

            {occurrences.length > 10 && (
              <Text mt="md" size="sm" c="dimmed">
                Showing 10 of {occurrences.length} occurrences
              </Text>
            )}
          </Box>

          {firstOccurrence?.context &&
            Object.keys(firstOccurrence.context).length > 0 && (
              <>
                <Divider />

                <Box p="md">
                  <Text size="xs" c="dimmed" tt="uppercase" mb="sm">
                    Additional Context
                  </Text>

                  <CodeHighlight
                    code={JSON.stringify(firstOccurrence.context, null, 2)}
                    language="json"
                  />
                </Box>
              </>
            )}
        </Stack>
      )}
    </div>
  );
}
