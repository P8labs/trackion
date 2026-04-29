import { useMemo } from "react";
import {
  AccountSetting01Icon,
  AutoConversationsIcon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { PLine } from "@/components/Line";
import moment from "moment";
import { userHooks } from "@/hooks/queries/use-user";
import { ErrorBanner } from "@/components/core/error-banner";

export function UsagePage() {
  const { data: usage, isLoading, error } = userHooks.useUsage();

  const eventPercent = useMemo(() => {
    if (!usage || usage.events_limit <= 0) {
      return 0;
    }

    return Math.min((usage.events_used / usage.events_limit) * 100, 100);
  }, [usage]);

  const periodEndLabel = usage
    ? moment(new Date(usage.current_period_end)).format("MM/DD/YYYY")
    : "-";

  const lastResetLabel = usage
    ? moment(new Date(usage.last_usage_reset)).format("MM/DD/YYYY")
    : "-";

  const daysToPeriodEnd = usage
    ? Math.max(moment(usage.current_period_end).diff(moment(), "days"), 0)
    : 0;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl border border-border/60">
        <div className="border-b border-border/60 px-5 py-4">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-4 px-5 py-5">
          <div className="h-20 animate-pulse rounded border border-border/60 bg-muted/20" />
          <div className="h-20 animate-pulse rounded border border-border/60 bg-muted/20" />
        </div>
      </div>
    );
  }

  if (error || !usage) {
    return <ErrorBanner label="Unable to load usage details." error={error} />;
  }

  return (
    <section className="relative mx-auto h-full max-w-4xl py-4">
      <PLine />
      <div className="relative border-b px-4 py-6 md:px-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Workspace Usage
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Usage and Quota
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Subscription limits and current usage across core resources.
        </p>
      </div>

      <section className="border-b border-border/60 px-5 py-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Plan
            </p>
            <p className="mt-1 text-sm font-medium capitalize">{usage.plan}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Status
            </p>
            <p className="mt-1 text-sm font-medium capitalize">
              {usage.status}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Period Ends
            </p>
            <p className="mt-1 text-sm font-medium">{periodEndLabel}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Last Reset
            </p>
            <p className="mt-1 text-sm font-medium">{lastResetLabel}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Current billing window has {daysToPeriodEnd} day(s) remaining.
        </p>
      </section>

      <section className="border-b border-border/60 px-5 py-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <HugeiconsIcon icon={AutoConversationsIcon} size={16} />
            Events
          </span>
          <span className="font-medium">
            {usage.events_used.toLocaleString()} /{" "}
            {usage.events_limit.toLocaleString()}
          </span>
        </div>
        <div className="h-2 rounded bg-muted/40">
          <div
            className="h-2 rounded bg-primary/60"
            style={{ width: `${eventPercent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Used {eventPercent.toFixed(1)}%</span>
          <span>{usage.events_remaining.toLocaleString()} remaining</span>
        </div>
      </section>

      <section className="border-b border-border/60 px-5 py-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <HugeiconsIcon icon={Folder01Icon} size={16} />
            Projects
          </span>
          <span className="font-medium">
            {usage.projects_used} / {usage.projects_limit}
          </span>
        </div>
        <div className="h-2 rounded bg-muted/40">
          <div
            className="h-2 rounded bg-primary/60"
            style={{ width: `${usage.projects_used_percent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Used {usage.projects_used_percent.toFixed(1)}%</span>
          <span>{usage.projects_remaining} slots remaining</span>
        </div>
      </section>

      <section className="border-b border-border/60 px-5 py-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <HugeiconsIcon icon={AccountSetting01Icon} size={16} />
            Remote Config Keys
          </span>
          <span className="font-medium">
            {usage.config_unlimited
              ? `${usage.configs_used} / Unlimited`
              : `${usage.configs_used} / ${usage.config_keys_limit}`}
          </span>
        </div>
        {!usage.config_unlimited && (
          <div className="h-2 rounded bg-muted/40">
            <div
              className="h-2 rounded bg-primary/60"
              style={{ width: `${usage.config_keys_used_percent}%` }}
            />
          </div>
        )}
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {usage.config_unlimited
              ? "Unlimited plan"
              : `Used ${usage.config_keys_used_percent.toFixed(1)}%`}
          </span>
          <span>
            {usage.config_unlimited
              ? "No key cap"
              : `${usage.config_keys_remaining} keys remaining`}
          </span>
        </div>
      </section>

      <section className="border-b px-5 py-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Feature Flags
            </p>
            <p className="mt-1 text-sm font-medium">
              {usage.feature_flags_used}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Error Retention
            </p>
            <p className="mt-1 text-sm font-medium">
              {usage.error_retention_days} days
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Rollout Support
            </p>
            <p className="mt-1 text-sm font-medium">
              {usage.supports_rollout ? "Enabled" : "Not available"}
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
