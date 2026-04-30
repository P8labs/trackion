import { parseDomainsInput } from "@/lib/domain";
import type { ProjectSettings } from "@trackion/lib/types";
import z from "zod";

export const defaultProjectSettings: ProjectSettings = {
  auto_pageview: true,
  time_spent: true,
  campaign: true,
  clicks: true,
};

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  domains: z.array(
    z
      .string()
      .min(5, "Please enter at least one domain")
      .refine((v) => {
        const { invalidDomains } = parseDomainsInput(v);
        return invalidDomains.length === 0;
      }, "One or more domains are invalid. Please check your input."),
  ),
  settings: z.object({
    auto_pageview: z.boolean(),
    time_spent: z.boolean(),
    campaign: z.boolean(),
    clicks: z.boolean(),
  }),
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;
