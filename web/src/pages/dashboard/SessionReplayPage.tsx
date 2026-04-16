import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import "rrweb-player/dist/style.css";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  PlayCircleIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  queryKeys,
  useDeleteReplaySession,
  useProject,
  useReplaySession,
  useReplaySessions,
} from "@/hooks/useApi";
import { useStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";

function ReplayPlayer({ events }: { events: Record<string, unknown>[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isDisposed = false;
    const mountNode = containerRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let playerInstance: any = null;

    async function mountPlayer() {
      if (!mountNode) {
        return;
      }

      mountNode.innerHTML = "";

      if (events.length === 0) {
        return;
      }

      const { default: RRWebPlayer } = await import("rrweb-player");
      if (isDisposed || !mountNode) {
        return;
      }

      const width = Math.max(360, Math.min(mountNode.clientWidth - 8, 1200));

      // rrweb-player does not expose strict TS typings in this setup.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      playerInstance = new (RRWebPlayer as any)({
        target: mountNode,
        props: {
          events,
          width,
          autoPlay: false,
          showController: true,
        },
      });
    }

    mountPlayer();

    return () => {
      isDisposed = true;
      if (playerInstance?.$destroy) {
        playerInstance.$destroy();
      }
      if (mountNode) {
        mountNode.innerHTML = "";
      }
    };
  }, [events]);

  return (
    <div className="trackion-replay-shell rounded-2xl border border-border/60 bg-card/70 p-2 md:p-3 overflow-hidden">
      <div ref={containerRef} className="min-h-130 w-full overflow-x-auto" />
      <style>
        {`
          .trackion-replay-shell .rr-player {
            background: hsl(var(--card)) !important;
            border: 1px solid hsl(var(--border)) !important;
            border-radius: 12px;
            box-shadow: none !important;
            color: hsl(var(--foreground)) !important;
            width: 100% !important;
            max-width: 100%;
            float: none;
          }

          .trackion-replay-shell .rr-player__frame {
            background: hsl(var(--background)) !important;
          }

          .trackion-replay-shell .replayer-wrapper {
            max-width: 100%;
          }

          .trackion-replay-shell .rr-controller {
            background: hsl(var(--card)) !important;
            border-top: 1px solid hsl(var(--border)) !important;
            min-height: 72px;
            color: hsl(var(--foreground)) !important;
          }

          .trackion-replay-shell .rr-controller .rr-timeline__time {
            color: hsl(var(--muted-foreground)) !important;
            font-size: 12px;
          }

          .trackion-replay-shell .rr-controller .rr-progress {
            background: hsl(var(--muted)) !important;
            border-top-color: transparent !important;
            border-bottom-color: transparent !important;
          }

          .trackion-replay-shell .rr-controller .rr-progress__step {
            background: color-mix(in oklab, hsl(var(--primary)) 20%, transparent) !important;
          }

          .trackion-replay-shell .rr-controller .rr-progress__handler,
          .trackion-replay-shell .rr-controller .rr-controller__btns button.active {
            background: hsl(var(--primary)) !important;
          }

          .trackion-replay-shell .rr-controller .rr-controller__btns button {
            color: hsl(var(--foreground)) !important;
          }

          .trackion-replay-shell .rr-controller .rr-controller__btns button:active {
            background: color-mix(in oklab, hsl(var(--primary)) 22%, transparent) !important;
          }

          .trackion-replay-shell .rr-controller .switch label:before {
            background: color-mix(in oklab, hsl(var(--primary)) 50%, transparent) !important;
          }

          .trackion-replay-shell .rr-controller .switch input[type='checkbox']:checked + label:before {
            background: hsl(var(--primary)) !important;
          }

          .trackion-replay-shell .rr-controller .switch label:after {
            background: hsl(var(--background)) !important;
          }

          .trackion-replay-shell .rr-controller .switch .label {
            color: hsl(var(--muted-foreground)) !important;
            font-size: 12px;
          }
        `}
      </style>
    </div>
  );
}

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
    <section className="px-4 md:px-6 py-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Session Replay
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse captured sessions and play rrweb recordings for{" "}
            {activeProject.name}.
          </p>
        </div>

        <Button
          variant="ghost"
          className="h-9 gap-2 border border-border/60"
          onClick={() => refetchSessions()}
          disabled={sessionsLoading}
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            className={sessionsLoading ? "animate-spin" : ""}
          />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card className="p-3 h-fit max-h-[76vh] overflow-y-auto border-border/60">
          <div className="px-2 pb-3">
            <div className="text-sm font-medium">Sessions</div>
            <div className="text-xs text-muted-foreground mt-1">
              {sessions.length} recorded sessions
            </div>
          </div>

          {sessionsLoading ? (
            <div className="py-10 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No replay sessions yet.
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
                const isActive = session.session_id === selectedSessionId;

                return (
                  <button
                    key={session.session_id}
                    type="button"
                    onClick={() =>
                      setManualSelectedSessionId(session.session_id)
                    }
                    className={`w-full text-left rounded-xl border px-3 py-3 transition ${
                      isActive
                        ? "border-primary/40 bg-primary/10"
                        : "border-border/60 hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-mono text-xs truncate">
                        {session.session_id}
                      </div>
                      <Badge variant="outline" className="text-[11px]">
                        {session.chunk_count} chunks
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last seen{" "}
                      {formatDistanceToNow(new Date(session.last_seen_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-4 md:p-5 border-border/60">
          {!selectedSession ? (
            <div className="min-h-130 flex items-center justify-center text-muted-foreground">
              Select a session to start playback.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={PlayCircleIcon} className="h-4 w-4" />
                    <span className="text-sm font-medium">Session Details</span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground break-all">
                    {selectedSession.session_id}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Started{" "}
                    {formatDistanceToNow(new Date(selectedSession.started_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">{replayEvents.length} events</Badge>

                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button variant="outline" className="h-8 gap-2" />
                      }
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                      Delete
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete replay session?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove the session and all its
                          replay chunks.
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
                              exact: false,
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

              {replayLoading ? (
                <div className="min-h-130 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : replayError ? (
                <div className="min-h-130 flex flex-col items-center justify-center text-center gap-3">
                  <HugeiconsIcon
                    icon={PlayCircleIcon}
                    className="h-8 w-8 text-muted-foreground"
                  />
                  <p className="text-sm text-muted-foreground">
                    Could not load replay events for this session.
                  </p>
                </div>
              ) : replayEvents.length === 0 ? (
                <div className="min-h-130 flex items-center justify-center text-muted-foreground">
                  This session has no replay events.
                </div>
              ) : (
                <ReplayPlayer events={replayEvents} />
              )}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
