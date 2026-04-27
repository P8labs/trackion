import { HIcon } from "@/components/HIcon";
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
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useProjects, useUser } from "@/hooks/useApi";
import { useStore } from "@/store";
import type { Project } from "@/types";
import {
  Cancel01Icon,
  LayoutDashboard,
  Logout,
  Menu01Icon,
  MinusSignIcon,
  Settings01Icon,
  ShieldAlert,
  SquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";

export default function Topbar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen?: boolean;
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const navigate = useNavigate();
  const { logout } = useStore();
  const { data: user, isLoading: userLoading } = useUser();
  const { data: projects = [] } = useProjects();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const onAction = async (action: "min" | "max" | "close") => {
    await invoke("handle_window_action", { action });
  };

  const profileInitials = useMemo(() => {
    if (userLoading) {
      return "..";
    }

    if (user?.avatar_url) {
      return "";
    }

    const emailLocal = (user?.email || "user").split("@")[0];
    const parts = emailLocal.split(/[._-]+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0] || "U"}${parts[1][0] || "S"}`.toUpperCase();
    }

    return emailLocal.slice(0, 2).toUpperCase() || "US";
  }, [user?.avatar_url, user?.email]);

  const profileName = userLoading ? "Loading user..." : user?.name || "User";
  const profileEmail = userLoading
    ? "Fetching profile"
    : user?.email || "No email";

  const handleLogoutConfirm = () => {
    logout();
    setLogoutDialogOpen(false);
    setSidebarOpen?.(false);
    navigate("/auth");
  };

  return (
    <header
      className="
            h-14 flex items-center justify-between
            border-b border-border/60
            px-4 md:px-6
            bg-border/10
          "
      data-tauri-drag-region
    >
      {sidebarOpen !== undefined && setSidebarOpen !== undefined ? (
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="
              lg:hidden
              text-muted-foreground hover:text-foreground
              transition
            "
          >
            {sidebarOpen ? (
              <X size={18} />
            ) : (
              <HugeiconsIcon icon={Menu01Icon} size={18} />
            )}
          </button>

          <Breadcrumb projects={projects} />
        </div>
      ) : (
        <div className="h-14 flex items-center">
          <img src="/trackion_t.png" className="w-10 h-10" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button className="flex items-center">
                <Avatar size="sm" className="cursor-pointer">
                  <AvatarImage
                    src={userLoading ? "" : user?.avatar_url || ""}
                  />
                  <AvatarFallback>{profileInitials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52 border-border/60">
              <div className="px-3 py-2 border-b border-border/60">
                <p className="text-sm font-medium truncate">{profileName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {profileEmail}
                </p>
              </div>

              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <HugeiconsIcon icon={Settings01Icon} className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate("/usage")}>
                <HugeiconsIcon
                  icon={LayoutDashboard}
                  className="mr-2 h-4 w-4"
                />
                Usage
              </DropdownMenuItem>

              <div className="border-t border-border/60 my-1" />

              <DropdownMenuItem
                onClick={() => setLogoutDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <HugeiconsIcon icon={Logout} className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="flex h-full items-stretch">
          <Button
            variant="ghost"
            type="button"
            aria-label="Minimize"
            size="icon"
            onClick={async () => await onAction("min")}
          >
            <HIcon icon={MinusSignIcon} className="size-5" />
          </Button>
          <Button
            variant="ghost"
            type="button"
            aria-label="Maximize"
            size="icon"
            onClick={async () => await onAction("max")}
          >
            <HIcon icon={SquareIcon} className="size-4" />
          </Button>
          <Button
            variant="ghost"
            type="button"
            aria-label="Close"
            size="icon"
            onClick={async () => await onAction("close")}
          >
            <HIcon icon={Cancel01Icon} className="size-5" />
          </Button>
        </div>
      </div>

      <AlertDialog
        open={logoutDialogOpen}
        onOpenChange={(open) => setLogoutDialogOpen(open)}
      >
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
    </header>
  );
}

function Breadcrumb({ projects }: { projects: Project[] }) {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split("/").filter(Boolean);

  const getLabel = (segment: string) => {
    if (segment === "projects") return "Projects";
    if (segment === "dashboard") return "Projects";

    const project = projects?.find((p) => p.id === segment);
    if (project) return project.name;

    return segment.substring(0, 16);
  };

  return (
    <div className="flex items-center gap-1 text-sm min-w-0">
      {segments.map((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        return (
          <div key={path} className="flex items-center gap-1 min-w-0">
            <button
              onClick={() => !isLast && navigate(path)}
              disabled={isLast}
              className={`
            px-1.5 py-0.5 rounded
            truncate
            transition
            ${
              isLast
                ? "text-foreground cursor-default"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30 cursor-pointer"
            }
          `}
            >
              {getLabel(segment).normalize()}
            </button>

            {!isLast && (
              <span className="text-muted-foreground/40 px-0.5">/</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
