/**
 * @deprecated
 */

import { useEffect, useMemo, useState } from "react";
import { Link, matchPath, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  PieChart,
  Radio,
  Bug,
  Activity,
  Braces,
  SlidersHorizontal,
} from "lucide-react";
import { useStore } from "../store";
import { getProjects } from "../lib/api";
import type { Project } from "../types";
import Topbar from "@/pages/dashboard/components/Topbar";
import { cn } from "@/lib/utils";

const overviewSubmenu = [
  { name: "Overview", section: "overview", icon: LayoutDashboard },
  { name: "Events", section: "events", icon: Activity },
  { name: "Breakdown", section: "breakdown", icon: PieChart },
  { name: "Realtime", section: "realtime", icon: Radio },
];

export function Layout() {
  const location = useLocation();
  const { currentProject, setCurrentProject, authToken, serverUrl } =
    useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const projectDashboardMatch = matchPath("/dashboard/:id", location.pathname);
  const projectDashboardId = projectDashboardMatch?.params.id || "";
  const isProjectDashboard = !!projectDashboardId;

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
    if (!isProjectDashboard || !projectDashboardId || projects.length === 0) {
      return;
    }

    const matchedProject = projects.find(
      (project) => project.id === projectDashboardId,
    );

    if (matchedProject && matchedProject.id !== currentProject?.id) {
      setCurrentProject(matchedProject);
    }
  }, [
    currentProject?.id,
    isProjectDashboard,
    projectDashboardId,
    projects,
    setCurrentProject,
  ]);

  const currentSection =
    new URLSearchParams(location.search).get("section") || "overview";

  const projectLinks = useMemo(() => {
    if (!projectDashboardId) {
      return [];
    }

    return [
      {
        name: "Project Settings",
        path: `/projects/${projectDashboardId}`,
        icon: SlidersHorizontal,
      },
      {
        name: "Error Tracking",
        path: "/errors",
        icon: Bug,
      },
      {
        name: "Remote Config",
        path: `/projects/${projectDashboardId}#remote-config`,
        icon: Braces,
      },
    ];
  }, [projectDashboardId]);

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
              {overviewSubmenu.map((item) => {
                const Icon = item.icon;
                const isActive =
                  isProjectDashboard && currentSection === item.section;

                return (
                  <Link
                    key={item.section}
                    to={`/projects/${projectDashboardId}?section=${item.section}`}
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

            <div className="space-y-1 pt-2">
              <p className="px-2 text-[11px] uppercase tracking-[0.12em] text-sidebar-foreground/55">
                Project
              </p>
              {projectLinks.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path.includes("#remote-config") &&
                    location.pathname === `/projects/${projectDashboardId}`);

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
