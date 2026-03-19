import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from "../../hooks/useApi";
import type { ProjectSettings } from "../../types";

export function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading, error } = useProjects();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    projectId: string | null;
  }>({
    isOpen: false,
    projectId: null,
  });

  const handleCreateProject = async (data: {
    name: string;
    domains: string[];
    settings: ProjectSettings;
  }) => {
    try {
      await createProjectMutation.mutateAsync(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProjectMutation.mutateAsync(projectId);
      setDeleteModal({ isOpen: false, projectId: null });
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your analytics projects
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive">
          <p className="text-sm">Failed to load projects. Please try again.</p>
        </div>
      )}

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto max-w-sm">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first project to start tracking analytics and gain
              insights into your website's performance.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create First Project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="font-semibold text-lg leading-none truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Created {formatDate(project.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModal({
                        isOpen: true,
                        projectId: project.id,
                      });
                    }}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Domains:</div>
                  <div className="flex flex-wrap gap-1">
                    {(project.domains || []).slice(0, 2).map((domain, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {domain}
                      </Badge>
                    ))}
                    {(project.domains || []).length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{(project.domains || []).length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up a new project to start tracking analytics.
            </DialogDescription>
          </DialogHeader>
          <CreateProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setShowCreateModal(false)}
            error={createProjectMutation.error?.message}
            loading={createProjectMutation.isPending}
          />
        </DialogContent>
      </Dialog>

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

interface CreateProjectFormProps {
  onSubmit: (data: {
    name: string;
    domains: string[];
    settings: ProjectSettings;
  }) => void;
  onCancel: () => void;
  error?: string;
  loading?: boolean;
}

function CreateProjectForm({
  onSubmit,
  onCancel,
  error,
  loading = false,
}: CreateProjectFormProps) {
  const [name, setName] = useState("");
  const [domains, setDomains] = useState("");
  const [settings, setSettings] = useState<ProjectSettings>({
    auto_pageview: true,
    time_spent: true,
    campaign: true,
    clicks: true,
  });

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const domainList = domains
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    onSubmit({
      name,
      domains: domainList,
      settings,
    });

    setName("");
    setDomains("");
    setSettings({
      auto_pageview: true,
      time_spent: true,
      campaign: true,
      clicks: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div className="space-y-2">
        <Label htmlFor="projectName" className="text-sm font-medium">
          Project Name
        </Label>
        <Input
          id="projectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Website"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="domains" className="text-sm font-medium">
          Allowed Domains
        </Label>
        <Input
          id="domains"
          value={domains}
          onChange={(e) => setDomains(e.target.value)}
          placeholder="example.com, www.example.com"
          required
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated list of domains where analytics will be collected
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Feature Settings</Label>
        <div className="grid gap-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.auto_pageview}
              onChange={(e) =>
                setSettings({ ...settings, auto_pageview: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            <div className="space-y-1">
              <div className="text-sm font-medium">Auto Pageview</div>
              <div className="text-xs text-muted-foreground">
                Automatically track page views when visitors navigate
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.time_spent}
              onChange={(e) =>
                setSettings({ ...settings, time_spent: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            <div className="space-y-1">
              <div className="text-sm font-medium">Time Spent Tracking</div>
              <div className="text-xs text-muted-foreground">
                Track how long visitors spend on each page
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.campaign}
              onChange={(e) =>
                setSettings({ ...settings, campaign: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            <div className="space-y-1">
              <div className="text-sm font-medium">Campaign Tracking</div>
              <div className="text-xs text-muted-foreground">
                Track UTM parameters and marketing campaigns
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.clicks}
              onChange={(e) =>
                setSettings({ ...settings, clicks: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            <div className="space-y-1">
              <div className="text-sm font-medium">Click Tracking</div>
              <div className="text-xs text-muted-foreground">
                Track button clicks and link interactions
              </div>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Project"}
        </Button>
      </DialogFooter>
    </form>
  );
}
