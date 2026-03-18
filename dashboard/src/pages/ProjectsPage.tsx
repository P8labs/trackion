import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
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
} from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useStore } from "../store";
import { getProjects, createProject, deleteProject } from "../lib/api";
import type { Project, ProjectSettings } from "../types";

export function ProjectsPage() {
  const navigate = useNavigate();
  const { authToken, serverUrl } = useStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    projectId: string | null;
  }>({
    isOpen: false,
    projectId: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [authToken, serverUrl]); // Add dependencies or use useCallback

  const loadProjects = async () => {
    if (!authToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects(serverUrl, authToken);
      // Ensure data is an array - defensive programming
      let projectsArray: Project[] = [];
      if (Array.isArray(data)) {
        projectsArray = data;
      } else if (data && typeof data === "object") {
        // Handle case where API returns { projects: [...] } or { data: [...] }
        projectsArray = (data as any).projects || (data as any).data || [];
      }
      setProjects(projectsArray);
    } catch (error) {
      console.error("Failed to load projects:", error);
      setError("Failed to load projects. Please try again.");
      // Reset to empty array on error to prevent map errors
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: {
    name: string;
    domains: string[];
    settings: ProjectSettings;
  }) => {
    if (!authToken) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createProject(data, serverUrl, authToken);
      await loadProjects();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create project. Please try again.";
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!authToken) return;
    setDeleting(true);
    try {
      await deleteProject(projectId, serverUrl, authToken);
      await loadProjects();
      setDeleteModal({ isOpen: false, projectId: null });
    } catch (error) {
      console.error("Failed to delete project:", error);
      // Keep the modal open and show error in the main component
      setError("Failed to delete project. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          New Project
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive flex items-center justify-between">
          <p className="text-sm">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="text-destructive hover:text-destructive/80"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Projects Table */}
      {projects.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="mb-4 text-muted-foreground">No projects created yet</p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create First Project
          </Button>
        </Card>
      ) : (
        <Card className="border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Domains
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(Array.isArray(projects) ? projects : []).map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium">
                        {project.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(project.domains || [])
                          .slice(0, 2)
                          .map((domain, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground"
                            >
                              {domain}
                            </span>
                          ))}
                        {(project.domains || []).length > 2 && (
                          <span className="px-2 py-1 text-xs rounded bg-secondary text-muted-foreground">
                            +{(project.domains || []).length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(project.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModal({
                            isOpen: true,
                            projectId: project.id,
                          });
                        }}
                        className="p-1.5 rounded transition-colors text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Project Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up a new project to start tracking analytics.
            </DialogDescription>
          </DialogHeader>
          <CreateProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setShowCreateModal(false)}
            error={createError}
            loading={creating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <AlertDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteModal({ isOpen: false, projectId: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteModal.projectId) {
                  handleDeleteProject(deleteModal.projectId);
                }
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
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
  error?: string | null;
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

  const handleSubmit = (e: React.FormEvent) => {
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

    // Reset form
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="projectName"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Project Name
        </label>
        <Input
          id="projectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Website"
          required
        />
      </div>

      <div>
        <label
          htmlFor="domains"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Allowed Domains
        </label>
        <Input
          id="domains"
          value={domains}
          onChange={(e) => setDomains(e.target.value)}
          placeholder="example.com, www.example.com"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Comma-separated list of domains
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Features
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.auto_pageview}
              onChange={(e) =>
                setSettings({ ...settings, auto_pageview: e.target.checked })
              }
              className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-ring focus:ring-2"
            />
            <div>
              <span className="text-foreground">Auto Pageview</span>
              <p className="text-xs text-muted-foreground">
                Automatically track page views
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.time_spent}
              onChange={(e) =>
                setSettings({ ...settings, time_spent: e.target.checked })
              }
              className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-ring focus:ring-2"
            />
            <div>
              <span className="text-foreground">Time Spent</span>
              <p className="text-xs text-muted-foreground">
                Track time spent on pages
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.campaign}
              onChange={(e) =>
                setSettings({ ...settings, campaign: e.target.checked })
              }
              className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-ring focus:ring-2"
            />
            <div>
              <span className="text-foreground">Campaign Tracking</span>
              <p className="text-xs text-muted-foreground">
                Track UTM parameters
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.clicks}
              onChange={(e) =>
                setSettings({ ...settings, clicks: e.target.checked })
              }
              className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-ring focus:ring-2"
            />
            <div>
              <span className="text-foreground">Click Tracking</span>
              <p className="text-xs text-muted-foreground">
                Track button and link clicks
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Error Display */}
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
