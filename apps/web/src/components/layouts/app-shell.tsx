import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@trackion/ui/lib";
import { userHooks } from "@/hooks/queries/use-user";
import {
  Avatar,
  Burger,
  Code,
  Divider,
  Group,
  Menu,
  NavLink,
} from "@mantine/core";
import { ChartPieIcon, LogOutIcon, Settings } from "lucide-react";
import { LogoutModal } from "../core/modals/logout-modal";
import { useDisclosure } from "@mantine/hooks";
import { Breadcrumb } from "./breadcrumbs";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({
  links,
}: {
  links: { path: string; name: string; icon: any }[];
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpened, { toggle: sideBarToggle }] = useDisclosure(false);
  const [opened, { close, open }] = useDisclosure(false);
  const { data: serverHealth } = userHooks.useServerHealth();
  const { data: user, isLoading: userLoading } = userHooks.useUser();

  const serverVersion = serverHealth?.server_version
    ? `v${serverHealth.server_version}`
    : "???";

  const profileName = user?.name || "User";
  const profileEmail = user?.email || "email";

  return (
    <div className="h-screen flex">
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-60 w-64",
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

            {links.map((Item) => (
              <NavLink
                component={Link}
                key={Item.path}
                label={Item.name}
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
      {sidebarOpened && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={sideBarToggle}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-(--mantine-color-gray-4) dark:border-(--mantine-color-dark-4)">
          <div className="flex items-center gap-3 min-w-0">
            <Burger
              opened={sidebarOpened}
              onClick={sideBarToggle}
              aria-label="Toggle navigation"
              className="lg:hidden transition"
            />

            <Breadcrumb />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Menu>
              <Menu.Target>
                <Avatar
                  src={userLoading ? "" : user?.avatar_url || ""}
                  size="sm"
                  name={profileName}
                  className="cursor-pointer"
                />
              </Menu.Target>

              <Menu.Dropdown className="w-52!">
                <Menu.Label className="px-3 py-2">
                  <p className="text-sm font-medium truncate">{profileName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {profileEmail}
                  </p>
                </Menu.Label>
                <Divider />
                <Menu.Item
                  leftSection={<Settings className="mr-2 h-4 w-4" />}
                  onClick={() => navigate("/settings")}
                >
                  Settings
                </Menu.Item>

                <Menu.Item
                  leftSection={<ChartPieIcon className="mr-2 h-4 w-4" />}
                  onClick={() => navigate("/subscriptions")}
                >
                  Subscriptions
                </Menu.Item>

                <Divider />

                <Menu.Item
                  leftSection={<LogOutIcon className="mr-2 h-4 w-4" />}
                  className="text-destructive focus:text-destructive"
                  onClick={open}
                  c="red"
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>

          <LogoutModal close={close} opened={opened} />
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
