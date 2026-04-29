import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
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
} from "../ui/alert-dialog";
import { useDeleteProject } from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";

interface ProjectDangerZoneProps {
  project: {
    id: string;
    name: string;
  };
}

export function ProjectDangerZone({ project }: ProjectDangerZoneProps) {
  const deleteProjectMutation = useDeleteProject();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteProject = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      navigate("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <>
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
            <div>
              <h4 className="font-medium mb-1">Delete Project</h4>
              <p className="text-sm text-muted-foreground">
                Mark this project as deleted now. It will be removed permanently
                by background cleanup, including analytics data.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Project
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? It will be
              hidden immediately and permanently removed later by scheduled
              cleanup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProjectMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={deleteProjectMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProjectMutation.isPending
                ? "Deleting..."
                : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
