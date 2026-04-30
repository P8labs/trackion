import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, RefreshIcon } from "@hugeicons/core-free-icons";
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
} from "@trackion/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { ReplayPlayer } from "@/components/core/project/replay-player";
import { projectHooks } from "@/hooks/queries/use-project";
import { projectQueryKeys } from "@trackion/lib/queries";

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
    <section className="flex flex-col">
      <div className="px-4 md:px-6 py-4 border-b border-border/60 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Session Replay</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Playback recorded sessions
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
            {sessions.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-75 text-sm text-muted-foreground">
                No sessions yet
              </div>
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
            <div>
              <div className="px-4 md:px-6 py-6">
                <h2 className="text-lg font-medium">No session selected</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a session from the left to view its replay.
                </p>
              </div>
            </div>
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
                              queryKey: projectQueryKeys.replaySessions(
                                projectId,
                                10,
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
                <ReplayPlayer
                  projectId={projectId}
                  sessionId={selectedSession.session_id}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
