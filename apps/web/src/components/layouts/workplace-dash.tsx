import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  AccountSetting01Icon,
  AddSquareIcon,
  AutoConversationsIcon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

import { Topbar } from "@/components/layouts/topbar";
import { Badge } from "@trackion/ui/badge";
import { userHooks } from "@/hooks/queries/use-user";
import { NavItem } from "./nav-item";

const links = [
  { path: "/projects", name: "Projects", icon: Folder01Icon },
  { path: "/projects/new", name: "Create Project", icon: AddSquareIcon },
  { path: "/usage", name: "Usage", icon: AutoConversationsIcon },
  { path: "/settings", name: "Settings", icon: AccountSetting01Icon },
];

export function ProjectsWorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: usageData, isLoading: usageLoading } = userHooks.useUsage();
  const {
    data: serverHealth,
    isLoading: serverHealthLoading,
    isError: serverHealthError,
  } = userHooks.useServerHealth();

  const serverStatusLabel = serverHealthLoading
    ? "Checking"
    : serverHealthError
      ? "Down"
      : "Up";

  const serverVersion = serverHealth?.server_version
    ? `v${serverHealth.server_version}`
    : "Version unavailable";

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
                Dashboard
              </p>
              {links.map((item) => (
                <NavItem
                  key={item.path}
                  name={item.name}
                  path={item.path}
                  icon={item.icon}
                />
              ))}
            </div>
          </nav>

          <div className="border-t border-border/60 p-3 text-md space-y-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Server</span>

              <span className="text-muted-foreground text-sm truncate">
                {serverVersion} ({serverStatusLabel})
              </span>
            </div>

            <div className="pt-2 border-t border-border/60">
              <div className="flex justify-between text-muted-foreground">
                <span>Usage</span>
                <Badge
                  variant="secondary"
                  className="uppercase tracking-wide text-xs text-muted-foreground"
                >
                  {usageData?.plan || "plan"}
                </Badge>
              </div>

              {usageLoading ? (
                <p className="mt-2 text-sm">Loading...</p>
              ) : usageData ? (
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
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
                <p className="mt-2 text-sm">Unavailable</p>
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
