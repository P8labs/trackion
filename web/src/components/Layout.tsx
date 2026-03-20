import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LogOut,
  Settings,
  LayoutDashboard,
  FolderKanban,
  ChevronDown,
  Menu,
  X,
  Plus,
  Check,
  CircleDot,
  ShieldAlert,
} from "lucide-react";
import { useStore } from "../store";
import { getProjects, getServerHealth } from "../lib/api";
import type { Project } from "../types";
import { ThemeToggle } from "./ui/theme-toggle";
import { WEB_VERSION } from "../lib/constants";
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
} from "./ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

const primaryNav = [
  { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Settings", path: "/settings", icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject, logout, authToken, serverUrl } =
    useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", serverUrl, authToken],
    queryFn: () => getProjects(serverUrl, authToken!),
    enabled: !!authToken,
  });

  const {
    data: serverHealth,
    isLoading: serverHealthLoading,
    isError: serverHealthError,
  } = useQuery({
    queryKey: ["server-health", serverUrl],
    queryFn: () => getServerHealth(serverUrl),
    retry: 1,
    refetchInterval: 30000,
  });

  const projects = useMemo<Project[]>(() => {
    if (!projectsData) {
      return [];
    }

    if (Array.isArray(projectsData)) {
      return projectsData;
    }

    if (typeof projectsData === "object") {
      return (
        (projectsData as { projects?: Project[]; data?: Project[] }).projects ||
        (projectsData as { projects?: Project[]; data?: Project[] }).data ||
        []
      );
    }

    return [];
  }, [projectsData]);

  useEffect(() => {
    if (!currentProject && projects.length > 0) {
      setCurrentProject(projects[0]);
      return;
    }

    if (
      currentProject &&
      projects.length > 0 &&
      !projects.some((project) => project.id === currentProject.id)
    ) {
      setCurrentProject(projects[0]);
    }
  }, [currentProject, projects, setCurrentProject]);

  const handleLogoutConfirm = () => {
    logout();
    setLogoutDialogOpen(false);
    setSidebarOpen(false);
    navigate("/auth");
  };

  const serverStatusLabel = serverHealthLoading
    ? "Checking"
    : serverHealthError
      ? "Down"
      : "Up";

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside
        data-track
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-sidebar border-sidebar-border border-r ${
          sidebarOpen
            ? "animate-sidebar-in"
            : "-translate-x-full lg:translate-x-0"
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col px-3 py-4">
          <div className="flex items-center px-3 py-2">
            <div className="h-7 w-7 rounded-full flex items-center justify-center mb-2">
              <img src="/trackion_t.png" alt="Trackion" />
            </div>
            <div className="text-md font-semibold text-sidebar-foreground">
              Trackion
            </div>
          </div>

          <nav className="mt-8 px-1 space-y-1 flex-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border pt-3 px-2 space-y-3">
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3 text-xs text-sidebar-foreground/75">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sidebar-foreground">
                  Server
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                  <CircleDot
                    size={10}
                    className={
                      serverHealthError
                        ? "text-destructive"
                        : "text-emerald-500"
                    }
                  />
                  {serverStatusLabel}
                </span>
              </div>
              <p className="mt-1 truncate">
                v{serverHealth?.server_version || "unknown"}
              </p>
              <div className="mt-2 h-px bg-sidebar-border" />
              <p className="mt-2">
                Web{" "}
                <span className="font-medium text-sidebar-foreground">
                  v{WEB_VERSION}
                </span>
              </p>
            </div>

            <button
              onClick={() => setLogoutDialogOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <AlertDialog
        open={logoutDialogOpen}
        onOpenChange={(open) => setLogoutDialogOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <ShieldAlert className="h-6 w-6 text-destructive" />
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

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0">
        <header className="h-17 border-b bg-background border-border px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-5 min-w-0">
            <button
              data-track
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden transition-colors text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-sm min-w-0 text-muted-foreground">
              <span className="truncate">Trackion</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                data-track
                className="hidden sm:flex h-9 rounded-full border border-border bg-muted text-foreground hover:bg-muted/80 pl-3 pr-2 items-center gap-2 text-sm transition-colors"
              >
                <FolderKanban size={14} className="text-muted-foreground" />
                <span className="max-w-42.5 truncate">
                  {currentProject?.name || "Select Project"}
                </span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Projects</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {projectsLoading && (
                    <DropdownMenuItem disabled>
                      Loading projects...
                    </DropdownMenuItem>
                  )}

                  {!projectsLoading && projects.length === 0 && (
                    <DropdownMenuItem disabled>
                      No projects found
                    </DropdownMenuItem>
                  )}

                  {!projectsLoading &&
                    projects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        onClick={() => setCurrentProject(project)}
                        className="flex items-center justify-between"
                      >
                        <span className="truncate">{project.name}</span>
                        {currentProject?.id === project.id && (
                          <Check size={14} />
                        )}
                      </DropdownMenuItem>
                    ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/projects/new");
                      setSidebarOpen(false);
                    }}
                  >
                    <Plus size={14} />
                    <span>Create Project</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            <ThemeToggle />
          </div>
        </header>

        <main className="h-[calc(100vh-68px)] overflow-y-auto px-4 md:px-6 py-5 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
