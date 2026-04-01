import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Braces,
  ChevronRight,
  Copy,
  Check,
  Code,
  Flag,
  KeyRound,
  Pencil,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import CodeBox from "../../components/CodeBox";
import {
  useDeleteFeatureFlag,
  useDeleteRemoteConfig,
  useProject,
  useProjectRuntime,
  useUpdateProject,
  useUpsertFeatureFlag,
  useUpsertRemoteConfig,
} from "../../hooks/useApi";
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
  const navigate = useNavigate();
  const { serverUrl } = useStore();
  const updateProjectMutation = useUpdateProject(id || "");
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDomains, setEditDomains] = useState("");
  const [editSettings, setEditSettings] = useState(defaultSettings);
  const [flagKey, setFlagKey] = useState("");
  const [flagEnabled, setFlagEnabled] = useState(true);
  const [flagRollout, setFlagRollout] = useState(100);
  const [configKey, setConfigKey] = useState("");
  const [configValue, setConfigValue] = useState("{}");
  const [configError, setConfigError] = useState("");

  const { data: project, isLoading, error } = useProject(id!);
  const { data: runtimeData, isLoading: runtimeLoading } = useProjectRuntime(
    id || "",
  );

  const upsertFlagMutation = useUpsertFeatureFlag(id || "");
  const deleteFlagMutation = useDeleteFeatureFlag(id || "");
  const upsertConfigMutation = useUpsertRemoteConfig(id || "");
  const deleteConfigMutation = useDeleteRemoteConfig(id || "");

  useEffect(() => {
    if (!project) {
      return;
    }

    setEditName(project.name || "");
    setEditDomains((project.domains || []).join(", "));
    setEditSettings(project.settings || defaultSettings);
  }, [project]);

  if (isLoading) {
    return (
      <div className="max-w-5xl space-y-6">
        <Card className="py-0">
          <CardContent className="space-y-4 py-5">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-10 w-72" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="space-y-3 py-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid gap-3 md:grid-cols-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </CardContent>
        </Card>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="py-0">
            <CardContent className="space-y-3 py-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-28 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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

  if (error || !project) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center">
        <Card className="w-full border-destructive/20 bg-linear-to-b from-destructive/8 to-background py-0">
          <CardContent className="py-6 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Project not found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              The project might have been deleted or you may not have access to
              it anymore.
            </p>
            <Button
              onClick={() => navigate("/projects")}
              className="mt-5 gap-2"
            >
              Back to Projects
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
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

  const handleSaveFlag = async () => {
    const key = flagKey.trim();
    if (!key) {
      return;
    }

    const rollout = Number.isFinite(flagRollout)
      ? Math.max(0, Math.min(100, Math.floor(flagRollout)))
      : 0;

    await upsertFlagMutation.mutateAsync({
      key,
      enabled: flagEnabled,
      rollout_percentage: rollout,
    });

    setFlagKey("");
    setFlagEnabled(true);
    setFlagRollout(100);
  };

  const handleSaveConfig = async () => {
    const key = configKey.trim();
    if (!key) {
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(configValue);
    } catch {
      setConfigError("Config value must be valid JSON.");
      return;
    }

    setConfigError("");
    await upsertConfigMutation.mutateAsync({ key, value: parsed });
    setConfigKey("");
    setConfigValue("{}");
  };

  return (
    <div className="max-w-4xl space-y-5">
      <section className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/projects")}
            className="-ml-2 h-7 gap-1.5 px-2 text-xs"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Project settings and integration details.
            </p>
          </div>
        </div>

        <Button onClick={() => setEditOpen(true)} className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit Project
        </Button>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Domains</h2>
        <div className="flex flex-wrap gap-2">
          {(project.domains || []).length > 0 ? (
            (project.domains || []).map((domain) => (
              <Badge key={domain} variant="outline">
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

      <section className="space-y-2 border-t pt-4">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Code className="h-4 w-4" />
          Script Integration
        </h2>
        <p className="text-sm text-muted-foreground">
          Add this script to your website head to start tracking analytics.
        </p>
        <CodeBox code={scriptSnippet} language="html" />
      </section>

      <section className="space-y-2 border-t pt-4">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <KeyRound className="h-4 w-4" />
          API Key
        </h2>
        <p className="text-sm text-muted-foreground">
          Use this key in your client integration. Keep it private.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm">
            {project.api_key}
          </code>
          <Button variant="outline" className="gap-2" onClick={copyApiKey}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </section>

      <section id="project-settings" className="space-y-2 border-t pt-4">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="h-4 w-4" />
          Feature Settings
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {settingOptions.map(({ key, title }) => {
            const enabled = (project.settings || defaultSettings)[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
              >
                <span className="text-sm">{title}</span>
                <Badge variant={enabled ? "secondary" : "outline"}>
                  {enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            );
          })}
        </div>
      </section>

      <section id="feature-flags" className="space-y-3 border-t pt-4">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Flag className="h-4 w-4" />
          Feature Flags
        </h2>
        <p className="text-sm text-muted-foreground">
          Create boolean flags and control rollout percentage by user.
        </p>

        <div className="grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Flag Key</p>
            <Input
              value={flagKey}
              onChange={(e) => setFlagKey(e.target.value)}
              placeholder="checkout_v2"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Enabled</p>
            <div className="flex h-10 items-center rounded-md border px-3">
              <Checkbox
                checked={flagEnabled}
                onCheckedChange={(checked) => setFlagEnabled(Boolean(checked))}
              />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Rollout %</p>
            <Input
              type="number"
              min={0}
              max={100}
              value={flagRollout}
              onChange={(e) => setFlagRollout(Number(e.target.value))}
            />
          </div>
          <Button
            onClick={handleSaveFlag}
            disabled={upsertFlagMutation.isPending || !flagKey.trim()}
          >
            {upsertFlagMutation.isPending ? "Saving..." : "Save Flag"}
          </Button>
        </div>

        {runtimeLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (runtimeData?.flags || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No feature flags yet.</p>
        ) : (
          <div className="space-y-2">
            {(runtimeData?.flags || []).map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div>
                  <p className="font-mono text-sm">{item.key}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.enabled ? "Enabled" : "Disabled"} • Rollout:{" "}
                    {item.rollout_percentage}%
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFlagKey(item.key);
                      setFlagEnabled(item.enabled);
                      setFlagRollout(item.rollout_percentage);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteFlagMutation.mutate(item.key)}
                    disabled={deleteFlagMutation.isPending}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="remote-config" className="space-y-3 border-t pt-4">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Braces className="h-4 w-4" />
          Remote Config
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage JSON config values fetched by clients at runtime.
        </p>

        <div className="space-y-2 rounded-md border p-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Config Key</p>
            <Input
              value={configKey}
              onChange={(e) => setConfigKey(e.target.value)}
              placeholder="paywall.copy"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">JSON Value</p>
            <Textarea
              value={configValue}
              onChange={(e) => setConfigValue(e.target.value)}
              rows={6}
              className="font-mono text-xs"
            />
            {configError && (
              <p className="text-xs text-destructive">{configError}</p>
            )}
          </div>
          <Button
            onClick={handleSaveConfig}
            disabled={upsertConfigMutation.isPending || !configKey.trim()}
          >
            {upsertConfigMutation.isPending ? "Saving..." : "Save Config"}
          </Button>
        </div>

        {runtimeLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (runtimeData?.configs || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No configs yet.</p>
        ) : (
          <div className="space-y-2">
            {(runtimeData?.configs || []).map((item) => (
              <div key={item.key} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-mono text-sm">{item.key}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setConfigKey(item.key);
                        setConfigValue(JSON.stringify(item.value, null, 2));
                        setConfigError("");
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteConfigMutation.mutate(item.key)}
                      disabled={deleteConfigMutation.isPending}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
                <pre className="overflow-x-auto rounded-md bg-muted p-2 text-xs">
                  {JSON.stringify(item.value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update name, domains, and feature settings in one place.
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
                    className="flex items-start gap-3 rounded-lg border px-3 py-2.5"
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
