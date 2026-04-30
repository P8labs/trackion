import { useNavigate } from "react-router-dom";
import type { ProjectSettings } from "@trackion/lib/types";
import { PLine, PlusDecor } from "@trackion/ui/decoration";
import { projectHooks } from "@/hooks/queries/use-project";
import { Globe } from "lucide-react";
import { Badge } from "@trackion/ui/badge";
import { Button } from "@trackion/ui/button";
import { Input } from "@trackion/ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "@trackion/ui/field";
import { ErrorBanner } from "@/components/core/error-banner";
import { ProjectFeatureToggle } from "@/components/core/project/feature-toggle";
import {
  createProjectSchema,
  defaultProjectSettings,
  type CreateProjectData,
} from "./shared";

export function CreateProjectPage() {
  return (
    <section className="max-w-3xl mx-auto relative h-full">
      <PLine />
      <div className="px-4 md:px-6 py-6 relative border-b">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Project Setup
        </p>
        <h1 className="mt-1 text-xl font-medium tracking-tight">
          Create project
        </h1>
        <PlusDecor />
      </div>
      <CreateProjectForm />
    </section>
  );
}

export function CreateProjectForm() {
  const navigate = useNavigate();

  const form = useForm<CreateProjectData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      domains: [],
      settings: defaultProjectSettings,
    },
  });

  const createProjectMutation = projectHooks.useCreateProject();
  const handleCreateProject = async (data: CreateProjectData) => {
    try {
      await createProjectMutation.mutateAsync(data, {
        onSuccess: (project) => {
          navigate(`/projects/${project.id}`);
        },
      });
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const toggleSetting = (key: keyof ProjectSettings, checked: boolean) => {
    form.setValue(`settings.${key}`, checked, { shouldDirty: true });
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleCreateProject)}
      className="border border-border/60"
    >
      <FieldGroup>
        <section className="border-b border-border/60 px-4 py-4 md:px-5 relative">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Basics
          </p>

          <div className="mt-4 space-y-5">
            <div className="space-y-2">
              <Controller
                name="name"
                disabled={createProjectMutation.isPending}
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
                disabled={createProjectMutation.isPending}
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

          <PlusDecor />
        </section>

        <section className="border-b border-border/60 px-4 py-4 md:px-5 relative">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Tracking Features
          </p>
          <div className="mt-4 grid gap-0 border border-border/60 sm:grid-cols-2">
            <ProjectFeatureToggle
              title="Auto Pageview"
              description="Capture page views automatically on route changes."
              checked={form.watch("settings.auto_pageview")}
              onChange={(checked) => toggleSetting("auto_pageview", checked)}
              disabled={createProjectMutation.isPending}
            />
            <ProjectFeatureToggle
              title="Time Spent"
              description="Measure engaged time on each page."
              checked={form.watch("settings.time_spent")}
              onChange={(checked) => toggleSetting("time_spent", checked)}
              disabled={createProjectMutation.isPending}
            />
            <ProjectFeatureToggle
              title="Campaign"
              description="Track UTM source, medium, and campaign values."
              checked={form.watch("settings.campaign")}
              onChange={(checked) => toggleSetting("campaign", checked)}
              disabled={createProjectMutation.isPending}
            />
            <ProjectFeatureToggle
              title="Click Tracking"
              description="Track CTA clicks and interaction hotspots."
              checked={form.watch("settings.clicks")}
              onChange={(checked) => toggleSetting("clicks", checked)}
              disabled={createProjectMutation.isPending}
            />
          </div>
          <PlusDecor />
        </section>
      </FieldGroup>

      <div className="h-full flex items-center justify-end gap-2 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-5">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/projects")}
          disabled={createProjectMutation.isPending}
          className="h-9 rounded-md border-border/60 bg-transparent hover:bg-muted/20"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createProjectMutation.isPending}
          className="h-9 min-w-36 rounded-md"
        >
          {createProjectMutation.isPending ? "Creating..." : "Create Project"}
        </Button>
        <PlusDecor />
      </div>
    </form>
  );
}
