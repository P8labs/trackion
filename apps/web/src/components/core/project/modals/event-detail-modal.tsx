import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@trackion/ui/dialog";
import { Badge } from "@trackion/ui/badge";
import moment from "moment";
import type { RecentEventData } from "@trackion/lib/types";

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
  const parseProperties = (properties: unknown): Record<string, unknown> => {
    if (!properties) return {};
    try {
      const parsed =
        typeof properties === "string" ? JSON.parse(properties) : properties;
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
    return {};
  };

  const getEventColor = (eventName: string) => {
    switch (eventName) {
      case "page.view":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
      case "page.click":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30";
      case "page.time_spent":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30";
      default:
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30";
    }
  };

  const properties = useMemo(() => {
    return parseProperties(event?.properties);
  }, [event?.properties]);

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-100 w-[min(96vw,980px)] sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-3 min-w-0">
              <Badge className={getEventColor(event.event_name)}>
                {event.event_name}
              </Badge>
              <span className="text-xs font-normal text-muted-foreground truncate">
                {moment(event.created_at).format("MMM D, HH:mm:ss")}
              </span>
              <span className="text-xs font-mono text-muted-foreground shrink-0">
                #{event.id}
              </span>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto text-sm">
          <Section title="Event">
            {event.event_type && <Row label="Type">{event.event_type}</Row>}
            {event.user_id && (
              <Row label="User ID">
                <code className="break-all">{event.user_id}</code>
              </Row>
            )}
          </Section>

          <Section title="Session">
            <Row label="Session ID">
              <code className="truncate">{event.session_id}</code>
            </Row>

            <Row label="Timestamp">
              {moment(event.created_at).format("YYYY-MM-DD HH:mm:ss.SSS")}
            </Row>
          </Section>

          {(event.page_path || event.referrer) && (
            <Section title="Page">
              {event.page_title && (
                <Row label="Title">
                  <span className="break-all">{event.page_title}</span>
                </Row>
              )}

              {event.page_path && (
                <Row label="Path">
                  <code className="break-all">{event.page_path}</code>
                </Row>
              )}

              {event.referrer && event.referrer !== "Direct" && (
                <Row label="Referrer">
                  <a
                    href={event.referrer}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary hover:underline break-all"
                  >
                    {event.referrer}
                  </a>
                </Row>
              )}
            </Section>
          )}

          {(event.platform ||
            event.device ||
            event.browser ||
            event.os_version ||
            event.app_version) && (
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
          )}

          {(event.utm_source || event.utm_medium || event.utm_campaign) && (
            <Section title="UTM">
              {event.utm_source && <Row label="Source">{event.utm_source}</Row>}
              {event.utm_medium && <Row label="Medium">{event.utm_medium}</Row>}
              {event.utm_campaign && (
                <Row label="Campaign">{event.utm_campaign}</Row>
              )}
            </Section>
          )}

          {Object.keys(properties).length > 0 && (
            <Section title="Properties">
              {Object.entries(properties).map(([key, value]) => (
                <Row key={key} label={key}>
                  <code className="break-all">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </code>
                </Row>
              ))}
            </Section>
          )}

          <Section title="Raw">
            <pre className="text-xs text-muted-foreground overflow-x-auto">
              {JSON.stringify(event, null, 2)}
            </pre>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
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
    <div className="border-b border-border/60 px-5 py-4 space-y-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
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
    <div className="flex gap-4">
      <div className="w-32 shrink-0 text-xs text-muted-foreground font-mono">
        {label}
      </div>

      <div className="flex-1 text-sm text-foreground">{children}</div>
    </div>
  );
}
