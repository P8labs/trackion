import { useGlobalStore } from "@/store";
import { Avatar, Divider, Menu } from "@mantine/core";
import { ChartPieIcon, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProfileMenu() {
  const user = useGlobalStore((state) => state.user);
  const profileName = user?.name || "User";
  const profileEmail = user?.email || "email";

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <Menu>
        <Menu.Target>
          <Avatar
            src={user?.avatar_url || ""}
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
            component={Link}
            leftSection={<Settings className="mr-2 h-4 w-4" />}
            to="/settings"
          >
            Settings
          </Menu.Item>

          <Menu.Item
            component={Link}
            leftSection={<ChartPieIcon className="mr-2 h-4 w-4" />}
            to="/subscriptions"
          >
            Subscriptions
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
