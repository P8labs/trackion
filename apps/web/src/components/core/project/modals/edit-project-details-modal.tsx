import { projectHooks } from "@/hooks/queries/use-project";
import {
  createProjectSchema,
  type CreateProjectData,
} from "@/pages/projects/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProjectSettings } from "@trackion/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@trackion/ui/dialog";
import { Input } from "@trackion/ui/input";
import { Globe } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Field, FieldError, FieldGroup, FieldLabel } from "@trackion/ui/field";
import { ErrorBanner } from "@/components/core/error-banner";
import { Badge } from "@trackion/ui/badge";
import { Button } from "@trackion/ui/button";
import { projectQueryKeys } from "@trackion/lib/queries";
import { ProjectFeatureToggle } from "../feature-toggle";
import { useQueryClient } from "@tanstack/react-query";

interface EditProjectDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: CreateProjectData & { id: string };
}

export function EditProjectDetailsModal({
  open,
  onOpenChange,
  project,
}: EditProjectDetailsProps) {
  const form = useForm<CreateProjectData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: project.name,
      domains: project.domains,
      settings: project.settings,
    },
  });

  const editProjectMutation = projectHooks.useEditProject(project.id);
  const qc = useQueryClient();

  const onSubmit = async (data: CreateProjectData) => {
    try {
      await editProjectMutation.mutateAsync(data, {
        onSuccess: () => {
          onOpenChange(false);
          qc.invalidateQueries({
            queryKey: projectQueryKeys.project(project.id),
          });
        },
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update project:", err);
    } finally {
    }
  };

  const toggleSetting = (key: keyof ProjectSettings, checked: boolean) => {
    form.setValue(`settings.${key}`, checked, { shouldDirty: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-100 w-[min(96vw,980px)] sm:max-w-xl">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update name, domains, and feature settings.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-5">
              <div className="space-y-2">
                <Controller
                  name="name"
                  disabled={editProjectMutation.isPending}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="projectName"
                        className="text-xs uppercase tracking-[0.08em] text-muted-foreground"
                      >
                        Project Name
                      </FieldLabel>
                      <Input
                        id="projectName"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="Marketing Website"
                        autoFocus
                        required
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Use a clear name so your team can quickly identify this
                        property.
                      </p>
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  name="domains"
                  disabled={editProjectMutation.isPending}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="domains"
                        className="text-xs uppercase tracking-[0.08em] text-muted-foreground"
                      >
                        Allowed Domains
                      </FieldLabel>
                      <Input
                        id="domains"
                        value={field.value.join(", ")}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((d) => d.trim()),
                          )
                        }
                        placeholder="example.com, app.example.com, localhost:5173"
                        required
                      />
                      {fieldState.error && (
                        <ErrorBanner
                          label={fieldState.error.message || "Invalid domains"}
                        />
                      )}
                      <p className="text-xs text-muted-foreground">
                        Comma-separated domains. Protocols like https:// are not
                        needed.
                      </p>
                    </Field>
                  )}
                />

                {form.watch("domains").length > 0 && (
                  <div className="border border-border/60 bg-muted/10 px-3 py-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />
                      Domain preview
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {form.watch("domains").map((domain) => (
                        <Badge
                          key={domain}
                          variant={"secondary"}
                          className="text-xs"
                        >
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-0 border border-border/60 sm:grid-cols-2">
              <ProjectFeatureToggle
                title="Auto Pageview"
                description="Capture page views automatically on route changes."
                checked={form.watch("settings.auto_pageview")}
                onChange={(checked) => toggleSetting("auto_pageview", checked)}
                disabled={editProjectMutation.isPending}
              />
              <ProjectFeatureToggle
                title="Time Spent"
                description="Measure engaged time on each page."
                checked={form.watch("settings.time_spent")}
                onChange={(checked) => toggleSetting("time_spent", checked)}
                disabled={editProjectMutation.isPending}
              />
              <ProjectFeatureToggle
                title="Campaign"
                description="Track UTM source, medium, and campaign values."
                checked={form.watch("settings.campaign")}
                onChange={(checked) => toggleSetting("campaign", checked)}
                disabled={editProjectMutation.isPending}
              />
              <ProjectFeatureToggle
                title="Click Tracking"
                description="Track CTA clicks and interaction hotspots."
                checked={form.watch("settings.clicks")}
                onChange={(checked) => toggleSetting("clicks", checked)}
                disabled={editProjectMutation.isPending}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={editProjectMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.formState.isDirty || editProjectMutation.isPending
                }
              >
                {editProjectMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
