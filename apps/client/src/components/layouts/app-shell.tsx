import {
  Link,
  matchPath,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { cn } from "@/lib/utils";
import { userHooks } from "@/hooks/queries/use-user";
import { ActionIcon, Burger, Code, Group, NavLink } from "@mantine/core";
import { ArrowLeftIcon, LogOutIcon } from "lucide-react";
import { LogoutModal } from "../core/modals/logout-modal";
import { useDisclosure } from "@mantine/hooks";
import ProfileMenu from "./profile-menu";
import { allRoutes } from "@/routes";

export function AppShell({
  links = [],
  showHeader = true,
  showSidebar = true,
  minimalHeader = false,
}: {
  links?: { path: string; name: string; icon: any; handleBack?: boolean }[];
  showHeader?: boolean;
  showSidebar?: boolean;
  minimalHeader?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const [sidebarOpened, { toggle: sideBarToggle }] = useDisclosure(false);
  const [opened, { close, open }] = useDisclosure(false);

  const { data: serverHealth } = userHooks.useServerHealth();
  const currentRoute = allRoutes.find((route) =>
    matchPath({ path: route.path, end: true }, location.pathname),
  );

  const showBackButton = currentRoute?.meta?.showBackButton ?? false;
  showHeader = currentRoute?.meta?.showHeader ?? showHeader;

  const serverVersion = serverHealth?.server_version
    ? `v${serverHealth.server_version}`
    : "???";

  function transformedLinks() {
    // input links like /projects/:id/overview and current path /projects/123/overview should be active
    // get 123 from useParam and replace :id with 123 in links before comparing with location.pathname
    // this was the example of projects, we can have multiple such params in links so we need to replace all of them
    return links.map((link) => {
      let path = link.path;
      Object.keys(params).forEach((key) => {
        path = path.replace(`:${key}`, params[key] || "");
      });
      return { ...link, path };
    });
  }

  return (
    <div className="h-full flex min-h-0">
      {showSidebar && (
        <aside
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-999 w-64 shrink-0",
            sidebarOpened
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0",
            "transition-transform",
            "border-r-2 border-(--mantine-color-gray-4) dark:border-(--mantine-color-dark-4)",
            "bg-(--mantine-color-body)",
          )}
        >
          <nav className="h-full flex flex-col px-2">
            <div className="flex-1 overflow-y-auto">
              <Group
                className="border-b border-(--mantine-color-gray-4) dark:border-(--mantine-color-dark-4) p-4 h-14 mb-2"
                justify="space-between"
              >
                <div className="flex items-center space-x-1 text-primary">
                  <img src="/trackion_t.png" className="w-5 h-5" />
                  <span className="text-sm font-bold tracking-wide text-muted-foreground">
                    Trackion
                  </span>
                </div>
                <Code fw={700}>{serverVersion}</Code>
              </Group>

              {transformedLinks().map((Item) => (
                <NavLink
                  component={Link}
                  key={Item.path}
                  label={Item.name}
                  onClick={() => sideBarToggle()}
                  to={Item.path}
                  active={location.pathname == Item.path}
                  leftSection={<Item.icon className="w-5 h-5" />}
                />
              ))}
            </div>

            <div className="border-t border-(--mantine-color-gray-4) dark:border-(--mantine-color-dark-4) p-3 text-md space-y-4">
              <NavLink
                component={"button"}
                label="Log out"
                leftSection={<LogOutIcon className="w-5 h-5" />}
                onClick={open}
              />
              <LogoutModal opened={opened} close={close} />
            </div>
          </nav>
        </aside>
      )}
      {sidebarOpened && showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={sideBarToggle}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {showHeader && (
          <header
            className={cn(
              "h-14 flex items-center justify-between px-4 md:px-6 border-b border-(--mantine-color-gray-4) dark:border-(--mantine-color-dark-4)",
              minimalHeader && "bg-transparent border-0",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              {showSidebar && (
                <Burger
                  opened={sidebarOpened}
                  onClick={sideBarToggle}
                  aria-label="Toggle navigation"
                  className="lg:hidden transition"
                />
              )}

              {showBackButton && (
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  onClick={() => navigate(-1)}
                  data-tauri-drag-region={undefined}
                >
                  <ArrowLeftIcon size={18} />
                </ActionIcon>
              )}
            </div>

            <ProfileMenu />
          </header>
        )}
        <main className="flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
