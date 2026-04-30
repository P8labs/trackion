import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@trackion/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@trackion/ui/dropdown-menu";
import { ThemeToggle } from "@trackion/ui/theme-toggle";
import {
  Cancel01Icon,
  LayoutDashboard,
  Logout,
  Menu01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@trackion/ui/lib";
import { userHooks } from "@/hooks/queries/use-user";
import { LogoutModal } from "@/components/core/modals/logout-modal";

export function Topbar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = userHooks.useUser();

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const profileName = userLoading ? "Loading user..." : user?.name || "User";
  const profileEmail = userLoading
    ? "Fetching profile"
    : user?.email || "No email";

  return (
    <header className="h-14 flex items-center justify-between border-b border-border/60 px-4 md:px-6 bg-border/10">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-muted-foreground hover:text-foreground transition"
        >
          {sidebarOpen ? (
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          ) : (
            <HugeiconsIcon icon={Menu01Icon} size={18} />
          )}
        </button>

        <Breadcrumb />
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center">
              <Avatar size="sm" className="cursor-pointer">
                <AvatarImage src={userLoading ? "" : user?.avatar_url || ""} />
                <AvatarFallback>{profileName.substring(0, 2)}</AvatarFallback>
              </Avatar>
            </div>
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
              <HugeiconsIcon icon={LayoutDashboard} className="mr-2 h-4 w-4" />
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
      </div>

      <LogoutModal open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />
    </header>
  );
}

function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split("/").filter(Boolean);

  const getLabel = (segment: string) => {
    if (segment === "projects") return "Projects";
    if (segment === "dashboard") return "Projects";

    if (segment.length > 16) {
      return "...";
    }

    return capitalizeFirstLetter(segment.substring(0, 16));
  };

  return (
    <div className="flex items-center gap-1 text- min-w-0">
      {segments.map((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        return (
          <div key={path} className="flex items-center gap-1 min-w-0">
            <button
              onClick={() => !isLast && navigate(path)}
              disabled={isLast}
              className={cn(
                "px-1.5 py-0.5 rounded truncate transition",
                isLast
                  ? "text-foreground cursor-default"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30 cursor-pointer",
              )}
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

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
