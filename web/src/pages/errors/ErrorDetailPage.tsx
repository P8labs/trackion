import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  User,
  Monitor,
  Hash,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { useStore } from "../../store";
import { getErrorOccurrences } from "../../lib/api";
import type { ErrorOccurrence } from "../../types";
import { formatDistanceToNow } from "date-fns";

export function ErrorDetailPage() {
  const { fingerprint } = useParams<{ fingerprint: string }>();
  const navigate = useNavigate();
  const { authToken, serverUrl, currentProject } = useStore();
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);

  const { data: occurrences, isLoading } = useQuery({
    queryKey: ["error-occurrences", currentProject?.id, fingerprint],
    queryFn: () =>
      getErrorOccurrences(
        currentProject!.id,
        fingerprint!,
        serverUrl,
        authToken!,
      ),
    enabled: !!currentProject && !!fingerprint && !!authToken,
  });

  const handleBack = () => {
    navigate(`/projects/${currentProject?.id}/errors`);
  };

  const copyFingerprint = async () => {
    if (fingerprint) {
      await navigator.clipboard.writeText(fingerprint);
      setCopiedFingerprint(true);
      setTimeout(() => setCopiedFingerprint(false), 2000);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const formatStackTrace = (stackTrace: string) => {
    if (!stackTrace) return "No stack trace available";

    return stackTrace;
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="w-full max-w-md border border-border/60 p-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-3">
            No Project Selected
          </h2>
          <p className="text-muted-foreground mb-6">
            Please select a project to view error details.
          </p>
          <Button
            onClick={() => navigate("/projects")}
            className="w-full h-10 text-sm"
          >
            Go to Projects
          </Button>
        </div>
      </div>
    );
  }

  if (!fingerprint) {
    return <div>Error fingerprint required</div>;
  }

  const firstOccurrence = occurrences?.[0];
  const uniqueUsers = new Set(
    (occurrences || []).filter((o) => o.user_id).map((o) => o.user_id),
  ).size;
  const compactUrls = useMemo(() => {
    if (!occurrences || occurrences.length === 0) {
      return [] as Array<{ url: string; count: number }>;
    }

    const grouped = new Map<string, number>();
    for (const occurrence of occurrences) {
      const url = (occurrence.url || "").trim() || "(no-url)";
      grouped.set(url, (grouped.get(url) || 0) + 1);
    }

    return Array.from(grouped.entries())
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.url.localeCompare(b.url);
      })
      .slice(0, 8);
  }, [occurrences]);

  return (
    <div className="max-w-7xl mx-auto border-b border-border/60">
      <section className="px-4 py-3 md:px-6 border-b border-border/60 flex items-start justify-between gap-4">
        <div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Error Details
          </h1>
          {isLoading ? (
            <Skeleton className="h-5 w-80 mt-2" />
          ) : firstOccurrence ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {firstOccurrence.message}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Error fingerprint: {fingerprint}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          className="h-8 px-3 text-xs"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back
        </Button>
      </section>

      {isLoading ? (
        <div className="px-4 py-3 md:px-6 space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : !occurrences || occurrences.length === 0 ? (
        <section className="px-4 py-10 md:px-6 text-center border-b border-border/60">
          <AlertCircle className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-1">No occurrences found</h3>
          <p className="text-xs text-muted-foreground">
            This error fingerprint has no recorded occurrences.
          </p>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 border-b border-border/60">
            <div className="px-4 py-3 md:px-6 border-r border-border/60">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                Total
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {occurrences.length}
              </p>
            </div>
            <div className="px-4 py-3 md:px-6 border-r border-border/60">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Last Seen
              </p>
              <p className="mt-1 text-sm text-foreground">
                {formatTimeAgo(occurrences[0].timestamp)}
              </p>
            </div>
            <div className="px-4 py-3 md:px-6 border-r border-border/60">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Affected Users
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {uniqueUsers || 0}
              </p>
            </div>
            <div className="px-4 py-3 md:px-6">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5" />
                Browser
              </p>
              <p className="mt-1 text-sm text-foreground truncate">
                {firstOccurrence?.browser || "Unknown"}
              </p>
            </div>
          </section>

          <section className="px-4 py-3 md:px-6 border-b border-border/60">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Fingerprint
            </p>
            <div className="mt-2 flex items-center gap-2 border border-border/60 bg-muted/20 px-3 py-2 font-mono text-xs">
              <span className="flex-1 truncate">{fingerprint}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyFingerprint}
                className="h-6 w-6 p-0"
              >
                {copiedFingerprint ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </section>

          <section className="px-4 py-3 md:px-6 border-b border-border/60">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              URLs
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {compactUrls.map((entry) => (
                <div
                  key={entry.url}
                  className="inline-flex max-w-full items-center gap-2 border border-border/60 bg-muted/20 px-2.5 py-1 text-xs"
                >
                  {entry.url === "(no-url)" ? (
                    <span className="text-muted-foreground">(no-url)</span>
                  ) : (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="max-w-85 truncate text-foreground hover:text-primary"
                    >
                      {entry.url}
                    </a>
                  )}
                  <Badge
                    variant="outline"
                    className="h-5 px-1.5 font-mono text-[10px]"
                  >
                    {entry.count}
                  </Badge>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 py-3 md:px-6 border-b border-border/60">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Stack Trace
            </p>
            <pre className="mt-2 overflow-auto max-h-96 border border-border/60 bg-muted/20 p-3 text-xs leading-5 text-muted-foreground whitespace-pre-wrap wrap-break-word font-mono">
              {formatStackTrace(firstOccurrence?.stack_trace || "")}
            </pre>
          </section>

          <section className="border-b border-border/60">
            <div className="grid grid-cols-[120px_minmax(0,1fr)_150px_140px_140px] border-b border-border/60 px-4 py-2 md:px-6 text-[11px] uppercase tracking-wide text-muted-foreground">
              <span>Timestamp</span>
              <span>URL</span>
              <span>User</span>
              <span>Browser</span>
              <span>Platform</span>
            </div>

            <div className="divide-y divide-border/60">
              {occurrences.slice(0, 10).map((occurrence: ErrorOccurrence) => (
                <div
                  key={occurrence.id}
                  className="grid grid-cols-[120px_minmax(0,1fr)_150px_140px_140px] items-start gap-3 px-4 py-2.5 md:px-6 hover:bg-muted/20"
                >
                  <p className="text-xs text-muted-foreground pt-0.5">
                    {formatTimeAgo(occurrence.timestamp)}
                  </p>

                  <div className="min-w-0">
                    <a
                      href={occurrence.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-foreground hover:text-primary truncate block"
                    >
                      {occurrence.url || "-"}
                    </a>
                  </div>

                  <div>
                    {occurrence.user_id ? (
                      <Badge variant="outline" className="text-xs font-mono">
                        {occurrence.user_id}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Anonymous
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground pt-0.5">
                    {occurrence.browser || "Unknown"}
                  </p>

                  <p className="text-xs text-muted-foreground pt-0.5">
                    {occurrence.platform || "Unknown"}
                  </p>
                </div>
              ))}
            </div>

            {occurrences.length > 10 && (
              <div className="px-4 py-2.5 md:px-6 text-xs text-muted-foreground border-t border-border/60">
                Showing 10 of {occurrences.length} occurrences
              </div>
            )}
          </section>

          {firstOccurrence?.context &&
            Object.keys(firstOccurrence.context).length > 0 && (
              <section className="px-4 py-3 md:px-6 border-b border-border/60">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Additional Context
                </p>
                <pre className="mt-2 overflow-auto border border-border/60 bg-muted/20 p-3 text-xs leading-5 text-muted-foreground whitespace-pre-wrap wrap-break-word font-mono">
                  {JSON.stringify(firstOccurrence.context, null, 2)}
                </pre>
              </section>
            )}
        </>
      )}
    </div>
  );
}
