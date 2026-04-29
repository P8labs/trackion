import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useUpdateProject } from "../../hooks/useApi";
import type { ProjectSettings } from "../../types";

interface ProjectSettingsCardProps {
  project: {
    id: string;
    settings: ProjectSettings;
  };
}

const defaultSettings: ProjectSettings = {
  auto_pageview: true,
  time_spent: true,
  campaign: true,
  clicks: true,
};

const settingOptions = [
  {
    key: "auto_pageview" as keyof ProjectSettings,
    title: "Auto Pageview",
    description: "Automatically track page views when visitors navigate",
  },
  {
    key: "time_spent" as keyof ProjectSettings,
    title: "Time Spent Tracking",
    description: "Track how long visitors spend on each page",
  },
  {
    key: "campaign" as keyof ProjectSettings,
    title: "Campaign Tracking",
    description: "Track UTM parameters and marketing campaigns",
  },
  {
    key: "clicks" as keyof ProjectSettings,
    title: "Click Tracking",
    description: "Track button clicks and link interactions",
  },
];

export function ProjectSettingsCard({ project }: ProjectSettingsCardProps) {
  const updateProjectMutation = useUpdateProject(project.id);
  const currentSettings = project.settings || defaultSettings;

  const [settings, setSettings] = useState<ProjectSettings>(currentSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof ProjectSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    const changed = Object.keys(newSettings).some(
      (settingKey) =>
        newSettings[settingKey as keyof ProjectSettings] !==
        currentSettings[settingKey as keyof ProjectSettings],
    );
    setHasChanges(changed);
  };

  const handleUpdateSettings = async () => {
    await updateProjectMutation.mutateAsync({ settings });
    setHasChanges(false);
  };

  const resetSettings = () => {
    setSettings(currentSettings);
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {settingOptions.map((feature) => (
            <label
              key={feature.key}
              className="flex items-start gap-3 rounded-md border px-3 py-2.5"
            >
              <Checkbox
                checked={settings[feature.key]}
                onCheckedChange={(checked) =>
                  handleSettingChange(feature.key, Boolean(checked))
                }
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <div className="text-sm font-medium">{feature.title}</div>
                <div className="text-xs text-muted-foreground">
                  {feature.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-3">
          <Button
            variant="outline"
            onClick={resetSettings}
            disabled={updateProjectMutation.isPending || !hasChanges}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleUpdateSettings}
            disabled={updateProjectMutation.isPending || !hasChanges}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
