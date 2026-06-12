import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { useQueryClient } from "@tanstack/react-query";
import { ReplayPlayer } from "@/components/core/project/replay-player";
import { projectHooks } from "@/hooks/queries/use-project";
import { projectQueryKeys } from "@trackion/lib/queries";
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Grid,
  Group,
  Menu,
  Paper,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { RefreshCw, Trash2 } from "lucide-react";
import moment from "moment";

export function SessionReplayPage() {
  const queryClient = useQueryClient();

  const { id: projectId = "" } = useParams<{ id: string }>();
  const [manualSelectedSessionId, setManualSelectedSessionId] = useState("");

  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = projectHooks.useReplaySessions(projectId, 10, 15000);

  const selectedSessionId = useMemo(() => {
    if (!sessions.length) {
      return "";
    }

    if (
      manualSelectedSessionId &&
      sessions.some((session) => session.session_id === manualSelectedSessionId)
    ) {
      return manualSelectedSessionId;
    }

    return sessions[0].session_id;
  }, [manualSelectedSessionId, sessions]);

  const deleteMutation = projectHooks.useDeleteReplaySession(projectId);

  const selectedSession = useMemo(
    () =>
      sessions.find((session) => session.session_id === selectedSessionId) ||
      null,
    [sessions, selectedSessionId],
  );

  return (
    <Stack gap={0} className="px-4 py-6">
      <Group justify="space-between" align="flex-start" mb="md">
        <div>
          <Text fw={600} size="xl">
            Session Replay
          </Text>

          <Text size="sm" c="dimmed">
            Playback recorded user sessions
          </Text>
        </div>

        <Button
          variant="default"
          loading={sessionsLoading}
          leftSection={<RefreshCw size={14} />}
          onClick={() => refetchSessions()}
        >
          Refresh
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, xl: 9 }}>
          {!selectedSession ? (
            <Center h={500}>
              <Stack align="center" gap="xs">
                <Text fw={600}>No session selected</Text>

                <Text size="sm" c="dimmed">
                  Select a session to view replay.
                </Text>
              </Stack>
            </Center>
          ) : (
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Text ff="monospace" size="sm">
                    {selectedSession.session_id}
                  </Text>

                  <Text size="xs" c="dimmed">
                    {moment(new Date(selectedSession.started_at)).fromNow()}
                  </Text>
                </div>

                <Menu shadow="md">
                  <Menu.Target>
                    <ActionIcon color="red" variant="light">
                      <Trash2 size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      color="red"
                      onClick={async () => {
                        await deleteMutation.mutateAsync(
                          selectedSession.session_id,
                        );

                        await queryClient.invalidateQueries({
                          queryKey: projectQueryKeys.replaySessions(
                            projectId,
                            10,
                          ),
                        });

                        setManualSelectedSessionId("");
                      }}
                    >
                      Delete Session
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>

              <ReplayPlayer
                projectId={projectId}
                sessionId={selectedSession.session_id}
              />
            </Stack>
          )}
        </Grid.Col>
        <Grid.Col span={{ base: 12, xl: 3 }}>
          <Stack gap={0}>
            <Group justify="space-between" mb="sm">
              <Text fw={500} size="sm">
                Sessions
              </Text>

              <Text size="xs" c="dimmed">
                {sessions.length}
              </Text>
            </Group>

            {sessions.length === 0 ? (
              <Paper p="xl" withBorder={false}>
                <Text size="sm" c="dimmed" ta="center">
                  No sessions yet
                </Text>
              </Paper>
            ) : (
              <ScrollArea h={700}>
                <Stack gap={4}>
                  {sessions.map((session) => {
                    const active = session.session_id === selectedSessionId;

                    return (
                      <UnstyledButton
                        key={session.session_id}
                        onClick={() =>
                          setManualSelectedSessionId(session.session_id)
                        }
                      >
                        <Paper
                          p="sm"
                          bg={
                            active
                              ? "var(--mantine-primary-color-light)"
                              : undefined
                          }
                        >
                          <Group justify="space-between" gap="xs">
                            <Text ff="monospace" size="xs" truncate>
                              {session.session_id}
                            </Text>

                            <Badge variant="light" size="sm">
                              {session.chunk_count}
                            </Badge>
                          </Group>

                          <Text size="xs" c="dimmed" mt={4}>
                            {moment(new Date(session.last_seen_at)).fromNow()}
                          </Text>
                        </Paper>
                      </UnstyledButton>
                    );
                  })}
                </Stack>
              </ScrollArea>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
