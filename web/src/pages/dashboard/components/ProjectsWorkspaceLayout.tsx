import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AccountSetting01Icon,
  AddSquareIcon,
  AutoConversationsIcon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useStore } from "../../../store";
import { getServerHealth } from "../../../lib/api";
import { useUsage } from "@/hooks/useApi";

import { cn } from "@/lib/utils";
import Topbar from "./Topbar";

export function ProjectsWorkspaceLayout() {
  const location = useLocation();
  const { serverUrl } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: usageData, isLoading: usageLoading } = useUsage();

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

  const serverStatusLabel = serverHealthLoading
    ? "Checking"
    : serverHealthError
      ? "Down"
      : "Up";

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
                Dashboard
              </p>
              <NavItem
                to="/projects"
                active={location.pathname === "/projects"}
                icon={<HugeiconsIcon icon={Folder01Icon} size={15} />}
                label="Projects"
                onClick={() => setSidebarOpen(false)}
              />

              <NavItem
                to="/projects/new"
                active={location.pathname === "/projects/new"}
                icon={<HugeiconsIcon icon={AddSquareIcon} size={15} />}
                label="Create Project"
                onClick={() => setSidebarOpen(false)}
              />

              <NavItem
                to="/usage"
                active={location.pathname === "/usage"}
                icon={<HugeiconsIcon icon={AutoConversationsIcon} size={15} />}
                label="Usage"
                onClick={() => setSidebarOpen(false)}
              />

              <NavItem
                to="/settings"
                active={location.pathname === "/settings"}
                icon={<HugeiconsIcon icon={AccountSetting01Icon} size={15} />}
                label="Settings"
                onClick={() => setSidebarOpen(false)}
              />
            </div>
          </nav>

          <div className="border-t border-border/60 p-3 text-xs space-y-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Server</span>

              <span className="text-muted-foreground text-[11px] truncate">
                {serverHealth?.server_version
                  ? `v${serverHealth.server_version}`
                  : "Version unavailable"}{" "}
                ({serverStatusLabel})
              </span>
            </div>

            <div className="pt-2 border-t border-border/60">
              <div className="flex justify-between text-muted-foreground">
                <span>Usage</span>
                <span className="uppercase tracking-wide text-[10px]">
                  {usageData?.plan || "plan"}
                </span>
              </div>

              {usageLoading ? (
                <p className="mt-2 text-[11px]">Loading...</p>
              ) : usageData ? (
                <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                  <p>
                    {usageData.events_used.toLocaleString()} /{" "}
                    {usageData.events_limit.toLocaleString()} events
                  </p>
                  <p>
                    {usageData.projects_used} / {usageData.projects_limit}{" "}
                    projects
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-[11px]">Unavailable</p>
              )}
            </div>
          </div>
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

function NavItem({ to, icon, label, active, onClick }: any) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
