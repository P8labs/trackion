import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  FolderKanban,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { useProjects, useDeleteProject } from "../../hooks/useApi";
import { ProjectListCard } from "../../components/project";

export function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading, error } = useProjects();
  const deleteProjectMutation = useDeleteProject();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    projectId: string | null;
  }>({
    isOpen: false,
    projectId: null,
  });

  const filteredProjects = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return projects;
    }

    return projects.filter((project) => {
      const matchName = project.name.toLowerCase().includes(search);
      const matchDomain = (project.domains || []).some((domain) =>
        domain.toLowerCase().includes(search),
      );

      return matchName || matchDomain;
    });
  }, [projects, searchTerm]);

  const uniqueDomainCount = useMemo(
    () =>
      new Set(
        projects.flatMap((project) => (project.domains || []).map((d) => d)),
      ).size,
    [projects],
  );

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProjectMutation.mutateAsync(projectId);
      setDeleteModal({ isOpen: false, projectId: null });
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="py-0">
          <CardContent className="space-y-4 py-5">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-72" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-foreground/10 py-0">
        <CardContent className="space-y-5 py-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Project Workspace
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="text-muted-foreground">
                Manage websites, configure domains, and control tracking.
              </p>
            </div>
            <Button onClick={() => navigate("/projects/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Total Projects" value={String(projects.length)} />
            <StatCard
              label="Unique Domains"
              value={String(uniqueDomainCount)}
            />
            <StatCard
              label="Search Results"
              value={String(filteredProjects.length)}
            />
          </div>

          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find by project name or domain"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <p className="text-sm">Failed to load projects. Please try again.</p>
        </div>
      )}

      {projects.length === 0 ? (
        <Card className="py-0">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <FolderKanban className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No projects yet</h3>
            <p className="mb-6 max-w-md text-muted-foreground">
              Start with one project and add your domains to see real-time
              analytics, traffic sources, and custom events.
            </p>
            <Button onClick={() => navigate("/projects/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Project
            </Button>
          </CardContent>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card className="py-0">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No projects matched "{searchTerm}". Try a project name or domain.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectListCard
              key={project.id}
              project={project}
              onOpen={(projectId) => navigate(`/projects/${projectId}`)}
              onDelete={(projectId) =>
                setDeleteModal({ isOpen: true, projectId })
              }
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteModal({ isOpen: false, projectId: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? It will be hidden
              immediately and permanently removed later by scheduled cleanup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProjectMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteModal.projectId) {
                  handleDeleteProject(deleteModal.projectId);
                }
              }}
              disabled={deleteProjectMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
