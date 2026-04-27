import { useMemo, useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import type { ProjectSettings } from "../../types";
import { parseDomainsInput } from "../../lib/domain";
import PlusDecor from "../PlusDecor";

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

  const { domains: parsedDomains, invalidDomains } = useMemo(
    () => parseDomainsInput(domainsInput),
    [domainsInput],
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
    <form onSubmit={handleSubmit} className="border border-border/60">
      <section className="border-b border-border/60 px-4 py-4 md:px-5 relative">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Basics
        </p>

        <div className="mt-4 space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="projectName"
              className="text-xs uppercase tracking-[0.08em] text-muted-foreground"
            >
              Project Name
            </Label>
            <Input
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Marketing Website"
              autoFocus
              required
              className="h-10 rounded-md border-border/60 bg-transparent focus-visible:border-primary focus-visible:ring-0"
            />
            <p className="text-xs text-muted-foreground">
              Use a clear name so your team can quickly identify this property.
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="domains"
              className="text-xs uppercase tracking-[0.08em] text-muted-foreground"
            >
              Allowed Domains
            </Label>
            <Input
              id="domains"
              value={domainsInput}
              onChange={(e) => setDomainsInput(e.target.value)}
              placeholder="example.com, app.example.com, localhost:5173"
              required
              className="h-10 rounded-md border-border/60 bg-transparent focus-visible:border-primary focus-visible:ring-0"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated domains. Protocols like https:// are not needed.
            </p>

            {parsedDomains.length > 0 && (
              <div className="border border-border/60 bg-muted/10 px-3 py-3">
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
        </div>

        <PlusDecor />
      </section>

      <section className="border-b border-border/60 px-4 py-4 md:px-5 relative">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Tracking Features
        </p>
        <div className="mt-4 grid gap-0 border border-border/60 sm:grid-cols-2">
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
        </div>
        <PlusDecor />
      </section>

      {error && (
        <div className="border-b border-border/60 px-4 py-3 md:px-5">
          <div className="border border-destructive/30 bg-destructive/8 p-3 text-destructive">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="h-full flex items-center justify-end gap-2 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="h-9 rounded-md border-border/60 bg-transparent hover:bg-muted/20"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-9 min-w-36 rounded-md"
        >
          {loading ? "Creating..." : submitLabel}
        </Button>
        <PlusDecor />
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
    <label className="flex cursor-pointer items-start gap-3 border-b border-border/60 px-3 py-3 transition-colors odd:border-r hover:bg-muted/15 last:border-b-0 sm:nth-last-[-n+2]:border-b-0">
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
