import { userHooks } from "@/hooks/queries/use-user";
import { useGlobalStore } from "@/store";

import { useNavigate } from "react-router-dom";
import { Button, Modal } from "@mantine/core";

interface Props {
  opened: boolean;
  close: () => void;
}

export function LogoutModal({ opened, close }: Props) {
  const navigate = useNavigate();
  const logoutMutation = userHooks.useLogout();

  const handleLogoutConfirm = async () => {
    try {
      await logoutMutation.mutateAsync({});
    } catch (error) {
      console.error("[SERVER LOGOUT FAILED]", error);
    } finally {
      useGlobalStore.getState().actions.reset();
    }
    navigate("/auth");
    close();
  };
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Confirm Logout"
      size="md"
      centered
      id="logout-confirmation-modal"
    >
      <Modal.Body className="space-y-4">
        <p>
          You will be signed out from this browser session and redirected to the
          login page.
        </p>
        <div className="flex gap-2 items-center justify-end">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button color="red" onClick={handleLogoutConfirm}>
            Logout
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
