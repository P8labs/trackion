import { useParams } from "react-router-dom";
import RemoteConfigFlagsEditor from "@/components/core/project/remote-config/remote-config-flags-editor";
import RemoteConfigEditor from "@/components/core/project/remote-config/remote-config-editor";
import { Skeleton } from "@trackion/ui/skeleton";

import { projectHooks } from "@/hooks/queries/use-project";
import { ErrorBanner } from "@/components/core/error-banner";

export function RemoteConfigPage() {
  const { id = "" } = useParams<{ id: string }>();

  const {
    data: runtimeData,
    isLoading: runtimeLoading,
    error,
  } = projectHooks.useProjectRuntime(id);

  if (runtimeLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="border-b border-border/60 px-4 py-4 md:px-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid lg:grid-cols-2 border-b border-border/60">
          <div className="border-r border-border/60 p-4 md:p-6 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="p-4 md:p-6 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!runtimeData || error) {
    return (
      <ErrorBanner
        label="Failed to load runtime data. Please try again later."
        error={error}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <section className="border-b border-border/60 px-4 py-3 md:px-6">
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          Remote Config
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage feature flags and runtime config for {runtimeData.project.name}
        </p>
      </section>
      <section className="grid lg:grid-cols-2 border-y border-border/60">
        <RemoteConfigFlagsEditor
          flags={runtimeData.flags}
          projectId={runtimeData.project.id}
        />

        <RemoteConfigEditor
          configs={runtimeData.configs}
          projectId={runtimeData.project.id}
        />
      </section>
    </div>
  );
}
