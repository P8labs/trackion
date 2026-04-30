import { useState } from "react";
import { Outlet, useParams } from "react-router-dom";

import { Topbar } from "@/components/layouts/topbar";
import { cn } from "@/lib/utils";
import {
  Activity04Icon,
  ChartRoseIcon,
  CustomizeIcon,
  DashboardSquare03Icon,
  LiveStreaming02Icon,
  Settings02Icon,
  VideoReplayIcon,
  WifiError02Icon,
} from "@hugeicons/core-free-icons";
import { NavItem } from "./nav-item";

export function ProjectDashboardLayout() {
  const { id: projectId = "" } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Links = {
    analytics: [
      {
        name: "Overview",
        path: `/projects/${projectId}/overview`,
        icon: DashboardSquare03Icon,
      },
      {
        name: "Events",
        path: `/projects/${projectId}/events`,
        icon: Activity04Icon,
      },
      {
        name: "Breakdown",
        path: `/projects/${projectId}/breakdown`,
        icon: ChartRoseIcon,
      },
      {
        name: "Realtime",
        path: `/projects/${projectId}/realtime`,
        icon: LiveStreaming02Icon,
      },
    ],
    integrations: [
      {
        name: "Errors",
        path: `/projects/${projectId}/errors`,
        icon: WifiError02Icon,
      },
      {
        name: "Session Replay",
        path: `/projects/${projectId}/replays`,
        icon: VideoReplayIcon,
      },
    ],
    project: [
      {
        name: "Project Settings",
        path: `/projects/${projectId}/settings`,
        icon: Settings02Icon,
      },
      {
        name: "Remote Config",
        path: `/projects/${projectId}/remote-config`,
        icon: CustomizeIcon,
      },
    ],
  };

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
          <div className="h-14 flex items-center gap-2 px-4 py-4 border-b border-border/60 cursor-pointer">
            <img src="/trackion_t.png" className="w-5 h-5" />
            <span className="text-sm font-medium">Trackion</span>
          </div>

          <nav className="mt-2 px-1 space-y-1 flex-1">
            <div className="space-y-1">
              <p className="px-2 text-[11px] uppercase tracking-[0.12em] text-sidebar-foreground/55">
                Analytics
              </p>
              {Links.analytics.map((item) => (
                <NavItem
                  key={item.path}
                  name={item.name}
                  path={item.path}
                  icon={item.icon}
                />
              ))}
            </div>

            <div className="space-y-1 pt-2">
              <p className="px-2 text-[11px] uppercase tracking-[0.12em] text-sidebar-foreground/55">
                Integrations
              </p>
              {Links.integrations.map((item) => (
                <NavItem
                  key={item.path}
                  name={item.name}
                  path={item.path}
                  icon={item.icon}
                />
              ))}
            </div>

            <div className="space-y-1 pt-2">
              <p className="px-2 text-[11px] uppercase tracking-[0.12em] text-sidebar-foreground/55">
                Project
              </p>
              {Links.project.map((item) => (
                <NavItem
                  key={item.path}
                  name={item.name}
                  path={item.path}
                  icon={item.icon}
                />
              ))}
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
