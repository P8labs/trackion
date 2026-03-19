import { useMemo, useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { ProjectSettings } from "../../types";

interface CreateProjectFormProps {
  onSubmit: (data: {
    name: string;
    domains: string[];
    settings: ProjectSettings;
  }) => void;
  onCancel: () => void;
  error?: string;
  loading?: boolean;
  submitLabel?: string;
}

const defaultSettings: ProjectSettings = {
  auto_pageview: true,
  time_spent: true,
  campaign: true,
  clicks: true,
};

const domainPattern = /^(localhost|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?$/;

export function CreateProjectForm({
  onSubmit,
  onCancel,
  error,
  loading = false,
  submitLabel = "Create Project",
}: CreateProjectFormProps) {
  const [name, setName] = useState("");
  const [domainsInput, setDomainsInput] = useState("");
  const [settings, setSettings] = useState<ProjectSettings>(defaultSettings);

  const parsedDomains = useMemo(
    () =>
      domainsInput
        .split(",")
        .map((domain) => domain.trim().toLowerCase())
        .filter(Boolean),
    [domainsInput],
  );

  const invalidDomains = useMemo(
    () => parsedDomains.filter((domain) => !domainPattern.test(domain)),
    [parsedDomains],
  );

  const canSubmit =
    name.trim().length > 1 &&
    parsedDomains.length > 0 &&
    invalidDomains.length === 0 &&
    !loading;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmit({
      name: name.trim(),
      domains: parsedDomains,
      settings,
    });
  };

  const toggleSetting = (key: keyof ProjectSettings, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: checked }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="py-0">
        <CardHeader className="border-b bg-muted/40 py-4">
          <CardTitle className="text-sm font-semibold">Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Marketing Website"
              autoFocus
              required
            />
            <p className="text-xs text-muted-foreground">
              Use a clear name so your team can quickly identify this property.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domains">Allowed Domains</Label>
            <Input
              id="domains"
              value={domainsInput}
              onChange={(e) => setDomainsInput(e.target.value)}
              placeholder="example.com, app.example.com, localhost:5173"
              required
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated domains. Protocols like https:// are not needed.
            </p>

            {parsedDomains.length > 0 && (
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" />
                  Domain preview
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {parsedDomains.map((domain) => (
                    <Badge
                      key={domain}
                      variant={
                        invalidDomains.includes(domain)
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {invalidDomains.length > 0 && (
              <p className="text-xs text-destructive">
                Fix invalid domains: {invalidDomains.join(", ")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b bg-muted/40 py-4">
          <CardTitle className="text-sm font-semibold">
            Tracking Features
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 py-4 sm:grid-cols-2">
          <FeatureToggle
            title="Auto Pageview"
            description="Capture page views automatically on route changes."
            checked={settings.auto_pageview}
            onChange={(checked) => toggleSetting("auto_pageview", checked)}
          />
          <FeatureToggle
            title="Time Spent"
            description="Measure engaged time on each page."
            checked={settings.time_spent}
            onChange={(checked) => toggleSetting("time_spent", checked)}
          />
          <FeatureToggle
            title="Campaign"
            description="Track UTM source, medium, and campaign values."
            checked={settings.campaign}
            onChange={(checked) => toggleSetting("campaign", checked)}
          />
          <FeatureToggle
            title="Click Tracking"
            description="Track CTA clicks and interaction hotspots."
            checked={settings.clicks}
            onChange={(checked) => toggleSetting("clicks", checked)}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit} className="min-w-36">
          {loading ? "Creating..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface FeatureToggleProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function FeatureToggle({
  title,
  description,
  checked,
  onChange,
}: FeatureToggleProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30">
      <Checkbox
        checked={checked}
        onCheckedChange={(next) => onChange(!!next)}
      />
      <div className="space-y-1">
        <div className="text-sm font-medium leading-none">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </label>
  );
}
