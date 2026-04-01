import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";
import CodeBox from "../../components/CodeBox";
import { useProject, useUpdateProject } from "../../hooks/useApi";
import { parseDomainsInput } from "../../lib/domain";
import { useStore } from "../../store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";

const defaultSettings = {
  auto_pageview: true,
  time_spent: true,
  campaign: true,
  clicks: true,
};

const settingOptions = [
  {
    key: "auto_pageview" as const,
    title: "Auto Pageview",
    description: "Automatically track page views",
  },
  {
    key: "time_spent" as const,
    title: "Time Spent",
    description: "Measure time spent on pages",
  },
  {
    key: "campaign" as const,
    title: "Campaign",
    description: "Capture UTM parameters",
  },
  {
    key: "clicks" as const,
    title: "Clicks",
    description: "Track button and link clicks",
  },
];

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { serverUrl } = useStore();
  const updateProjectMutation = useUpdateProject(id || "");

  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDomains, setEditDomains] = useState("");
  const [editSettings, setEditSettings] = useState(defaultSettings);

  const { data: project, isLoading, error } = useProject(id || "");

  useEffect(() => {
    if (!project) {
      return;
    }

    setEditName(project.name || "");
    setEditDomains((project.domains || []).join(", "));
    setEditSettings(project.settings || defaultSettings);
  }, [project]);

  const { domains: parsedDomains, invalidDomains } =
    parseDomainsInput(editDomains);

  const hasChanges = useMemo(() => {
    if (!project) {
      return false;
    }

    const currentName = project.name || "";
    const currentSettings = project.settings || defaultSettings;
    const settingsChanged = settingOptions.some(
      ({ key }) => editSettings[key] !== currentSettings[key],
    );

    return (
      (editName?.trim() || "") !== currentName ||
      editDomains.trim() !== (project.domains || []).join(", ") ||
      settingsChanged
    );
  }, [editDomains, editName, editSettings, project]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto border-b border-border/60">
        <div className="px-4 py-4 md:px-6 border-b border-border/60">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="px-4 py-4 md:px-6 border-b border-border/60">
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid lg:grid-cols-2 border-b border-border/60">
          <div className="px-4 py-4 md:px-6 border-r border-border/60">
            <Skeleton className="h-28 w-full" />
          </div>
          <div className="px-4 py-4 md:px-6">
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6">
        <p className="text-sm text-muted-foreground">Project not found.</p>
      </div>
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

  const handleSaveProjectDetails = async () => {
    const normalizedName = editName?.trim() || "";

    if (!project || !normalizedName || invalidDomains.length > 0) {
      return;
    }

    await updateProjectMutation.mutateAsync({
      name: normalizedName,
      domains: parsedDomains,
      settings: editSettings,
    });

    setEditOpen(false);
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

        <Button onClick={() => setEditOpen(true)} className="h-8 px-3 text-xs">
          Edit
        </Button>
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

      <section className="grid lg:grid-cols-2 border-b border-border/60">
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
        <div className="mt-3 border border-border/60">
          {settingOptions.map(({ key, title, description }) => {
            const enabled = (project.settings || defaultSettings)[key];
            return (
              <div
                key={key}
                className="flex items-start justify-between gap-3 border-b border-border/60 px-3 py-2.5 last:border-b-0"
              >
                <div>
                  <p className="text-sm text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    enabled ? "border-emerald-500/30 text-emerald-600" : ""
                  }
                >
                  {enabled ? "On" : "Off"}
                </Badge>
              </div>
            );
          })}
        </div>
      </section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update name, domains, and feature settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Name</p>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Project name"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium">Domains</p>
              <Textarea
                value={editDomains}
                onChange={(e) => setEditDomains(e.target.value)}
                placeholder="example.com, app.example.com"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Enter comma-separated domains.
              </p>
              {invalidDomains.length > 0 && (
                <p className="text-xs text-destructive">
                  Invalid domains: {invalidDomains.join(", ")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Feature Settings</p>
              <div className="space-y-2">
                {settingOptions.map(({ key, title, description }) => (
                  <label
                    key={key}
                    className="flex items-start gap-3 border border-border/60 px-3 py-2.5"
                  >
                    <Checkbox
                      checked={editSettings[key]}
                      onCheckedChange={(checked) =>
                        setEditSettings((prev) => ({
                          ...prev,
                          [key]: Boolean(checked),
                        }))
                      }
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProjectDetails}
              disabled={
                !hasChanges ||
                !(editName?.trim() || "") ||
                invalidDomains.length > 0 ||
                updateProjectMutation.isPending
              }
            >
              {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
