import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useCreateProject } from "../../hooks/useApi";
import { CreateProjectForm } from "../../components/project";
import { Card, CardContent } from "../../components/ui/card";
import type { ProjectSettings } from "../../types";

export function CreateProjectPage() {
  const navigate = useNavigate();
  const createProjectMutation = useCreateProject();

  const handleCreateProject = async (data: {
    name: string;
    domains: string[];
    settings: ProjectSettings;
  }) => {
    try {
      const project = await createProjectMutation.mutateAsync(data);
      navigate(`/projects/${project.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="py-0">
        <CardContent className="space-y-4 py-5">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Project Setup
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Project
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Set up your website domains and tracking preferences. You can edit
              everything later from the project detail settings.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
            Tip: add production and staging domains now to avoid missing events
            during testing.
          </div>
        </CardContent>
      </Card>

      <CreateProjectForm
        onSubmit={handleCreateProject}
        onCancel={() => navigate("/projects")}
        error={createProjectMutation.error?.message}
        loading={createProjectMutation.isPending}
      />
    </div>
  );
}
