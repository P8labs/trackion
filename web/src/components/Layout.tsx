import { type ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Settings,
  LayoutDashboard,
  FolderKanban,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useStore } from "../store";
import { getProjects } from "../lib/api";
import type { Project } from "../types";
import { ThemeToggle } from "./ui/theme-toggle";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      if (!authToken) return;
      try {
        const data = await getProjects(serverUrl, authToken);
        let projectsArray: Project[] = [];
        if (Array.isArray(data)) {
          projectsArray = data;
        } else if (data && typeof data === "object") {
          projectsArray = (data as any).projects || (data as any).data || [];
        }
        setProjects(projectsArray);
        if (!currentProject && projectsArray.length > 0) {
          setCurrentProject(projectsArray[0]);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
        setProjects([]);
      }
    };
    loadProjects();
  }, [authToken, serverUrl, currentProject, setCurrentProject]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

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

          <div className="border-t border-sidebar-border pt-3 px-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-destructive hover:bg-destructive/10"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

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

            <div className="relative hidden sm:block">
              <button
                data-track
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="h-9 rounded-full border border-border bg-muted text-foreground hover:bg-muted/80 pl-3 pr-2 flex items-center gap-2 text-sm transition-colors"
              >
                <FolderKanban size={14} className="text-muted-foreground" />
                <span className="max-w-42.5 truncate">
                  {currentProject?.name || "Select Project"}
                </span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>

              {showProjectDropdown && projects.length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-border bg-popover shadow-2xl p-1 z-50">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setCurrentProject(project);
                        setShowProjectDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        currentProject?.id === project.id
                          ? "bg-accent text-accent-foreground"
                          : "text-popover-foreground hover:bg-accent/50"
                      }`}
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
