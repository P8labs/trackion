import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  queryKeys,
  useDeleteReplaySession,
  useProject,
  useReplaySession,
  useReplaySessions,
} from "@/hooks/useApi";
import { useStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { ReplayPlayer } from "./components/ReplayPlayer";

export function SessionReplayPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: projectId = "" } = useParams<{ id: string }>();
  const { currentProject } = useStore();

  const { data: projectFromRoute } = useProject(projectId);
  const activeProject = projectId
    ? projectFromRoute ||
      (currentProject?.id === projectId ? currentProject : null)
    : currentProject;

  const [manualSelectedSessionId, setManualSelectedSessionId] = useState("");

  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useReplaySessions(activeProject?.id || "", 100, 15000);

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

  const {
    data: replayPayload,
    isLoading: replayLoading,
    error: replayError,
  } = useReplaySession(activeProject?.id || "", selectedSessionId);

  const deleteMutation = useDeleteReplaySession(activeProject?.id || "");

  useEffect(() => {
    if (!activeProject?.id) {
      return;
    }

    const latestReplayTime = sessions[0]?.last_seen_at;
    if (!latestReplayTime) {
      return;
    }

    localStorage.setItem(
      `replay-last-seen-${activeProject.id}`,
      latestReplayTime,
    );
  }, [activeProject?.id, sessions]);

  const selectedSession = useMemo(
    () =>
      sessions.find((session) => session.session_id === selectedSessionId) ||
      null,
    [sessions, selectedSessionId],
  );

  const replayEvents = replayPayload?.events || [];

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh] p-6">
        <Card className="p-10 max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-3">Select a project</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Open a project to view and manage recorded session replays.
          </p>
          <Button onClick={() => navigate("/projects")}>Go to Projects</Button>
        </Card>
      </div>
    );
  }

  return (
    <section className="flex flex-col">
      <div className="px-4 md:px-6 py-4 border-b border-border/60 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Session Replay</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Playback recorded sessions for {activeProject.name}
          </p>
        </div>

        <button
          onClick={async () => await refetchSessions()}
          className="
              flex items-center gap-2
              text-xs px-3 h-8
              border border-border/60
              hover:bg-muted/20 transition
            "
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            size={16}
            className={sessionsLoading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid xl:grid-cols-[300px_1fr] border-b border-border/60">
        <div className="border-r border-border/60 flex flex-col">
          <div className="px-4 py-3 border-b border-border/60 text-xs text-muted-foreground">
            {sessions.length} sessions
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {sessionsLoading ? (
              <State>Loading sessions…</State>
            ) : sessions.length === 0 ? (
              <State>No sessions yet</State>
            ) : (
              sessions.map((session) => {
                const active = session.session_id === selectedSessionId;

                return (
                  <div
                    key={session.session_id}
                    onClick={() =>
                      setManualSelectedSessionId(session.session_id)
                    }
                    className={`
                  px-4 py-3 cursor-pointer transition
                  ${active ? "bg-primary/10" : "hover:bg-muted/20"}
                `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs truncate">
                        {session.session_id}
                      </span>

                      <span className="text-[11px] text-muted-foreground">
                        {session.chunk_count}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(session.last_seen_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col">
          {!selectedSession ? (
            <State>Select a session</State>
          ) : (
            <>
              <div className="px-4 md:px-6 py-3 border-b border-border/60 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-xs truncate">
                    {selectedSession.session_id}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(selectedSession.started_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {replayEvents.length} events
                  </span>

                  <AlertDialog>
                    <AlertDialogTrigger className="h-8 px-2 text-xs text-destructive hover:bg-muted/20">
                      <HugeiconsIcon icon={Delete02Icon} size={16} />
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={async () => {
                            await deleteMutation.mutateAsync(
                              selectedSession.session_id,
                            );
                            await queryClient.invalidateQueries({
                              queryKey: queryKeys.replaySessions(
                                activeProject.id,
                                100,
                              ),
                            });
                            setManualSelectedSessionId("");
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="flex-1">
                {replayLoading ? (
                  <State>Loading replay…</State>
                ) : replayError ? (
                  <State>Error loading replay</State>
                ) : replayEvents.length === 0 ? (
                  <State>No replay events</State>
                ) : (
                  <ReplayPlayer events={replayEvents} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function State({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center h-full min-h-75 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
