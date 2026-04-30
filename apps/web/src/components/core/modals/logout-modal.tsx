import { userHooks } from "@/hooks/queries/use-user";
import { useStore } from "@/store";
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

interface LogoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutModal({ open, onOpenChange }: LogoutModalProps) {
  const navigate = useNavigate();
  const { logout } = useStore();
  const logoutMutation = userHooks.useLogout();
  const handleLogoutConfirm = async () => {
    await logoutMutation.mutateAsync({});
    logout();
    onOpenChange(false);
    navigate("/auth");
  };

  return (
    <AlertDialog open={open} onOpenChange={(open) => onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <HugeiconsIcon
              icon={ShieldAlert}
              className="h-6 w-6 text-destructive"
            />
          </AlertDialogMedia>
          <AlertDialogTitle>Confirm logout</AlertDialogTitle>
          <AlertDialogDescription>
            You will be signed out from this browser session and redirected to
            the login page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogoutConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
