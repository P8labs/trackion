import { projectHooks } from "@/hooks/queries/use-project";
import { ShieldAlert } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
} from "@trackion/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface DeleteProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  projectId: string;
}

export function DeleteProjectModal({
  open,
  onOpenChange,
  projectName,
  projectId,
}: DeleteProjectModalProps) {
  const deleteProjectMutation = projectHooks.useDeleteProject(projectId);
  const navigate = useNavigate();

  const handleDeleteProject = async () => {
    await deleteProjectMutation.mutateAsync(
      {},
      {
        onSuccess: () => {
          onOpenChange(false);
          navigate("/projects");
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <HugeiconsIcon
              icon={ShieldAlert}
              className="h-6 w-6 text-destructive"
            />
          </AlertDialogMedia>
          <AlertDialogTitle>Confirm project deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the project "{projectName}"? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteProjectMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteProject}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteProjectMutation.isPending}
          >
            Delete Project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
