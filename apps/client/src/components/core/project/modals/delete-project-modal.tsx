import { projectHooks } from "@/hooks/queries/use-project";
import { Button, Code, Modal } from "@mantine/core";

import { useNavigate } from "react-router-dom";

interface DeleteProjectModalProps {
  opened: boolean;
  close: () => void;
  projectName: string;
  projectId: string;
}

export function DeleteProjectModal({
  close,
  opened,
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
          close();
          navigate("/projects");
        },
      },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Confirm Project Deletion"
      size="md"
      centered
      id="project-deletion-modal"
    >
      <Modal.Body className="space-y-4">
        <p>
          Are you sure you want to delete the project <Code>{projectName}</Code>
          ? This action cannot be undone.
        </p>
        <div className="flex gap-2 items-center justify-end">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteProject}>
            Delete Project
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
