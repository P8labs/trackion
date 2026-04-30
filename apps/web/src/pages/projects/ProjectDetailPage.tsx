import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@trackion/ui/button";
import { Badge } from "@trackion/ui/badge";
import { useStore } from "@/store";
import { CodeBox } from "@trackion/ui/code-box";
import { ProjectFeatureToggle } from "@/components/core/project/feature-toggle";

import { EditProjectDetailsModal } from "@/components/core/project/modals/edit-project-details-modal";
import { DeleteProjectModal } from "@/components/core/project/modals/delete-project-modal";

import { projectHooks } from "@/hooks/queries/use-project";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { ErrorBanner } from "@/components/core/error-banner";
import { LoadingBanner } from "@/components/core/loading-banner";

export function ProjectDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { serverUrl } = useStore();

  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: project, isLoading, error } = projectHooks.useProject(id);

  if (isLoading) {
    return <LoadingBanner />;
  }

  if (error || !project) {
    return (
      <ErrorBanner
        error={error}
        label="The project you are looking for does not exist or has been deleted."
      />
    );
  }

  const scriptSnippet = `<!-- Trackion Analytics -->
<script
  src="${serverUrl}/t.js"
  data-api-key="${project.api_key}"
></script>`;

  const copyApiKey = async () => {
    await navigator.clipboard.writeText(project.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <section className="px-4 py-3 md:px-6 border-b border-border/60 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Project
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {project.name}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Settings and integration details
          </p>
        </div>

        <div className="flex items-center">
          <Button
            onClick={() => setEditOpen(true)}
            className="h-8 px-3 text-xs"
          >
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <HugeiconsIcon icon={Delete02Icon} size={16} />
          </Button>
        </div>
      </section>

      <section className="px-4 py-2.5 md:px-6 border-b border-border/60">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Domains
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(project.domains || []).length > 0 ? (
            (project.domains || []).map((domain) => (
              <Badge key={domain} variant="outline" className="text-xs">
                {domain}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              No domains configured
            </span>
          )}
        </div>
      </section>

      <section className="grid border-b border-border/60">
        <div className="border-r border-border/60">
          <div className="px-4 py-2.5 md:px-6 border-b border-border/60">
            <h2 className="text-sm font-semibold text-foreground">
              Script Integration
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Add this snippet to your site head
            </p>
          </div>
          <div className="px-4 py-2.5 md:px-6">
            <CodeBox code={scriptSnippet} language="html" />
          </div>
        </div>

        <div>
          <div className="px-4 py-2.5 md:px-6 border-b border-border/60">
            <h2 className="text-sm font-semibold text-foreground">API Key</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Use this key in your client integration
            </p>
          </div>
          <div className="px-4 py-2.5 md:px-6">
            <div className="flex items-center gap-2">
              <code className="flex-1 border border-border/60 bg-muted/20 px-3 py-2 font-mono text-sm text-foreground overflow-x-auto">
                {project.api_key}
              </code>
              <Button
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={copyApiKey}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-2.5 md:px-6 border-b border-border/60">
        <h2 className="text-sm font-semibold text-foreground">
          Feature Settings
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Current tracking behavior for this project
        </p>
        <div className="mt-4 grid gap-0 border border-border/60 sm:grid-cols-2">
          <ProjectFeatureToggle
            title="Auto Pageview"
            description="Capture page views automatically on route changes."
            checked={project.settings.auto_pageview}
            disabled={true}
          />
          <ProjectFeatureToggle
            title="Time Spent"
            description="Measure engaged time on each page."
            checked={project.settings.time_spent}
            disabled={true}
          />
          <ProjectFeatureToggle
            title="Campaign"
            description="Track UTM source, medium, and campaign values."
            checked={project.settings.campaign}
            disabled={true}
          />
          <ProjectFeatureToggle
            title="Click Tracking"
            description="Track CTA clicks and interaction hotspots."
            checked={project.settings.clicks}
            disabled={true}
          />
        </div>
      </section>

      <EditProjectDetailsModal
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
      />
      <DeleteProjectModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        projectName={project.name}
        projectId={project.id}
      />
    </div>
  );
}
