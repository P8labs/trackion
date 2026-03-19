import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
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

export function ProjectSettingsCard({ project }: ProjectSettingsCardProps) {
  const updateProjectMutation = useUpdateProject(project.id);

  // Use default settings if project.settings is undefined
  const initialSettings = project.settings || defaultSettings;

  const [settings, setSettings] = useState<ProjectSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleUpdateSettings = async () => {
    try {
      await updateProjectMutation.mutateAsync({ settings });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to update project settings:", error);
    }
  };

  const handleSettingChange = (key: keyof ProjectSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Check if settings have changed from initial state
    const currentSettings = project.settings || defaultSettings;
    const hasActualChanges = Object.keys(newSettings).some(
      (key) =>
        newSettings[key as keyof ProjectSettings] !==
        currentSettings[key as keyof ProjectSettings],
    );
    setHasChanges(hasActualChanges);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {settingOptions.map((feature) => (
            <label
              key={feature.key}
              className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={settings[feature.key]}
                onChange={(e) =>
                  handleSettingChange(feature.key, e.target.checked)
                }
                className="mt-0.5 h-4 w-4 rounded border-border"
              />
              <div className="flex-1 space-y-1">
                <div className="font-medium">{feature.title}</div>
                <div className="text-sm text-muted-foreground">
                  {feature.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        {hasChanges && (
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              You have unsaved changes
            </p>
            <Button
              onClick={handleUpdateSettings}
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
