import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy, Check, AlertTriangle, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
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
import { useStore } from "../store";
import { getProject, updateProject, deleteProject } from "../lib/api";
import type { Project, ProjectSettings } from "../types";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authToken, serverUrl } = useStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [settings, setSettings] = useState<ProjectSettings>({
    auto_pageview: true,
    time_spent: true,
    campaign: true,
    clicks: true,
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id, authToken, serverUrl]); // Add dependencies

  const loadProject = async () => {
    if (!id || !authToken) return;
    setLoading(true);
    try {
      const data = await getProject(id, serverUrl, authToken);
      setProject(data);
      setSettings(data.settings);
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyApiKey = () => {
    if (project?.api_key) {
      navigator.clipboard.writeText(project.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateSettings = async () => {
    if (!id || !authToken) return;
    try {
      await updateProject(id, { ...settings }, serverUrl, authToken);
      setHasChanges(false);
      await loadProject();
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const handleDeleteProject = async () => {
    if (!id || !authToken) return;
    setDeleting(true);
    try {
      await deleteProject(id, serverUrl, authToken);
      navigate("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      setDeleting(false);
    }
  };

  const handleSettingChange = (key: keyof ProjectSettings, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div
            className="animate-spin-custom h-12 w-12 rounded-full border-2 border-var(--color-border) border-t-var(--color-accent) mx-auto"
            style={{
              borderTopColor: "var(--color-accent)",
            }}
          />
          <p className="mt-4" style={{ color: "var(--color-text-secondary)" }}>
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p
            className="text-lg"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Project not found
          </p>
          <Button onClick={() => navigate("/projects")} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 mb-4 transition-colors"
          style={{ color: "var(--color-text-secondary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-text)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-text-secondary)")
          }
        >
          <ArrowLeft size={20} />
          Back to Projects
        </button>
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Project Configuration
        </p>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Project Name
            </label>
            <p className="text-lg">{project.name}</p>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Allowed Domains
            </label>
            <div className="flex flex-wrap gap-2">
              {(project.domains || []).map((domain, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm"
                  style={{
                    backgroundColor: "var(--color-bg-tertiary)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              API Key
            </label>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 px-4 py-2 font-mono text-sm"
                style={{
                  backgroundColor: "var(--color-bg-tertiary)",
                  color: "var(--color-text)",
                }}
              >
                {project.api_key}
              </code>
              <Button
                onClick={handleCopyApiKey}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-4 pt-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Created
              </label>
              <p>
                {new Date(project.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Last Updated
              </label>
              <p>
                {new Date(project.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label
            className="flex items-center gap-3 cursor-pointer p-3 transition-colors"
            style={{ backgroundColor: "var(--color-bg-tertiary)" }}
          >
            <input
              type="checkbox"
              checked={settings.auto_pageview}
              onChange={(e) =>
                handleSettingChange("auto_pageview", e.target.checked)
              }
              className="w-5 h-5"
            />
            <div className="flex-1">
              <span className="font-medium block">Auto Pageview</span>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Automatically track page views when visitors navigate
              </p>
            </div>
          </label>

          <label
            className="flex items-center gap-3 cursor-pointer p-3 transition-colors"
            style={{ backgroundColor: "var(--color-bg-tertiary)" }}
          >
            <input
              type="checkbox"
              checked={settings.time_spent}
              onChange={(e) =>
                handleSettingChange("time_spent", e.target.checked)
              }
              className="w-5 h-5"
            />
            <div className="flex-1">
              <span className="font-medium block">Time Spent Tracking</span>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Track how long visitors spend on each page
              </p>
            </div>
          </label>

          <label
            className="flex items-center gap-3 cursor-pointer p-3 transition-colors"
            style={{ backgroundColor: "var(--color-bg-tertiary)" }}
          >
            <input
              type="checkbox"
              checked={settings.campaign}
              onChange={(e) =>
                handleSettingChange("campaign", e.target.checked)
              }
              className="w-5 h-5"
            />
            <div className="flex-1">
              <span className="font-medium block">Campaign Tracking</span>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Track UTM parameters and marketing campaigns
              </p>
            </div>
          </label>

          <label
            className="flex items-center gap-3 cursor-pointer p-3 transition-colors"
            style={{ backgroundColor: "var(--color-bg-tertiary)" }}
          >
            <input
              type="checkbox"
              checked={settings.clicks}
              onChange={(e) => handleSettingChange("clicks", e.target.checked)}
              className="w-5 h-5"
            />
            <div className="flex-1">
              <span className="font-medium block">Click Tracking</span>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Track button clicks and link interactions
              </p>
            </div>
          </label>

          {hasChanges && (
            <div className="pt-4">
              <Button onClick={handleUpdateSettings} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <div style={{ borderColor: "var(--color-border)" }}>
        <Card className="border">
          <div
            style={{
              borderBottom: "1px solid var(--color-border)",
              padding: "1.5rem",
            }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} style={{ color: "#ef4444" }} />
              <div
                style={{ color: "#ef4444" }}
                className="text-lg font-semibold"
              >
                Danger Zone
              </div>
            </div>
          </div>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium mb-1">Delete Project</h4>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Permanently delete this project and all its data. This action
                  cannot be undone.
                </p>
              </div>
              <Button onClick={() => setShowDeleteModal(true)}>
                Delete Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirm Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
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
              onClick={handleDeleteProject}
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
