import { useNavigate } from "react-router-dom";
import { useCreateProject } from "../../hooks/useApi";
import { CreateProjectForm } from "../../components/project";
import type { ProjectSettings } from "../../types";
import { PLine } from "@/components/Line";
import PlusDecor from "@/components/PlusDecor";

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

      <CreateProjectForm
        onSubmit={handleCreateProject}
        onCancel={() => navigate("/projects")}
        error={createProjectMutation.error?.message}
        loading={createProjectMutation.isPending}
      />
    </section>
  );
}
