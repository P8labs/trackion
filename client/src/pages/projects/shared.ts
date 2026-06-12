import type { ProjectSettings } from "@/types";

export const defaultProjectSettings: ProjectSettings = {
  auto_pageview: true,
  time_spent: true,
  campaign: true,
  clicks: true,
};

export type CreateProjectData = {
  name: string;
  domains: string[];
  settings: {
    auto_pageview: boolean;
    time_spent: boolean;
    campaign: boolean;
    clicks: boolean;
  };
};
