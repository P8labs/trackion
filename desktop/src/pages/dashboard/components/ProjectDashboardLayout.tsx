import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  PieChart,
  Radio,
  Activity,
  Braces,
  SlidersHorizontal,
  TriangleAlert,
  PlaySquare,
} from "lucide-react";
import { useReplaySessions } from "@/hooks/useApi";
import Topbar from "@/pages/dashboard/components/Topbar";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { Project } from "@/types";
import { getProjects } from "@/lib/api";

export function ProjectDashboardLayout() {
  const location = useLocation();
  const { id: projectId = "" } = useParams<{ id: string }>();
  const { currentProject, setCurrentProject, authToken, serverUrl } =
    useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: replaySessions = [] } = useReplaySessions(projectId, 1, 15000);

  const latestReplaySeenAt = replaySessions[0]?.last_seen_at || "";

  const lastReplaySeenAt = useMemo(() => {
    if (!projectId) {
      return "";
    }

    return localStorage.getItem(`replay-last-seen-${projectId}`) || "";
  }, [latestReplaySeenAt, location.pathname, projectId]);

  useEffect(() => {
    if (!projectId || !latestReplaySeenAt) {
      return;
    }

    if (location.pathname === `/projects/${projectId}/replays`) {
      localStorage.setItem(`replay-last-seen-${projectId}`, latestReplaySeenAt);
    }
  }, [latestReplaySeenAt, location.pathname, projectId]);

  const hasNewReplay = useMemo(() => {
    if (!latestReplaySeenAt) {
      return false;
    }

    if (!lastReplaySeenAt) {
      return true;
    }

    return (
      new Date(latestReplaySeenAt).getTime() >
      new Date(lastReplaySeenAt).getTime()
    );
  }, [lastReplaySeenAt, latestReplaySeenAt]);

  const { data: projectsData } = useQuery({
    queryKey: ["projects", serverUrl, authToken],
    queryFn: () => getProjects(serverUrl, authToken!),
    enabled: !!authToken,
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
    if (!projectId || projects.length === 0) {
      return;
    }

    const matchedProject = projects.find((project) => project.id === projectId);

    if (matchedProject && matchedProject.id !== currentProject?.id) {
      setCurrentProject(matchedProject);
    }
  }, [currentProject?.id, projectId, projects, setCurrentProject]);

  const analyticsLinks = useMemo(() => {
    if (!projectId) {
      return [];
    }

    return [
      {
        name: "Overview",
        path: `/projects/${projectId}/overview`,
        icon: LayoutDashboard,
      },
      { name: "Events", path: `/projects/${projectId}/events`, icon: Activity },
      {
        name: "Errors",
        path: `/projects/${projectId}/errors`,
        icon: TriangleAlert,
      },
      {
        name: "Breakdown",
        path: `/projects/${projectId}/breakdown`,
        icon: PieChart,
      },
      {
        name: "Realtime",
        path: `/projects/${projectId}/realtime`,
        icon: Radio,
      },
      {
        name: "Session Replay",
        path: `/projects/${projectId}/replays`,
        icon: PlaySquare,
      },
    ];
  }, [projectId]);

  const projectLinks = useMemo(() => {
    if (!projectId) {
      return [];
    }

    return [
      {
        name: "Project Settings",
        path: `/projects/${projectId}/settings`,
        icon: SlidersHorizontal,
      },
      {
        name: "Remote Config",
        path: `/projects/${projectId}/remote-config`,
        icon: Braces,
      },
    ];
  }, [projectId]);

  return (
    <div className="h-screen flex bg-background text-foreground">
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-60 w-60",
          "lg:bg-border/10 bg-background border-r border-border/60",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "transition-transform",
        )}
      >
        <div className="h-full flex flex-col">
          <div className="h-14 flex items-center gap-2 px-4 py-4 border-b border-border/60">
            <img src="/trackion_t.png" className="w-5 h-5" />
            <span className="text-sm font-medium">Trackion</span>
          </div>

          <nav className="mt-2 px-1 space-y-1 flex-1">
            <div className="space-y-1">
              <p className="px-2 text-[11px] uppercase tracking-[0.12em] text-sidebar-foreground/55">
                Analytics
              </p>
              {analyticsLinks.map((item) => {
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
                    <Icon size={15} />
                    <span className="inline-flex items-center gap-2">
                      {item.name}
                      {item.path.endsWith("/replays") && hasNewReplay ? (
                        <span
                          className="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"
                          aria-label="new replay sessions"
                        />
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="space-y-1 pt-2">
              <p className="px-2 text-[11px] uppercase tracking-[0.12em] text-sidebar-foreground/55">
                Project
              </p>
              {projectLinks.map((item) => {
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
                    <Icon size={15} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
