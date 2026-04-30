import { useStore } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@trackion/ui/avatar";
import moment from "moment";
import { PlusDecor, PLine } from "@trackion/ui/decoration";
import { userHooks } from "@/hooks/queries/use-user";
import { platform, version } from "@tauri-apps/plugin-os";
import { useEffect, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { getVersion } from "@tauri-apps/api/app";

export function SettingsPage() {
  const { user: storedUser } = useStore();
  const { data: profile } = userHooks.useUser();
  const [appVersion, setAppVersion] = useState<string>("Loading...");
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const osType = platform();
  const osVersion = version();

  const {
    data: health,
    isLoading: healthLoading,
    isError: healthError,
  } = userHooks.useServerHealth();

  useEffect(() => {
    const initializeInfo = async () => {
      try {
        const version = await getVersion();
        setAppVersion(version);
      } catch {
        setAppVersion("Unknown");
      }

      try {
        const update = await check();
        if (update) {
          setUpdateAvailable(true);
          setUpdateVersion(update.version);
        }
      } catch {}
    };

    initializeInfo();
  }, []);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const update = await check();
      if (update) {
        update.downloadAndInstall((e) => {
          console.log("Update progress:", e.event);
        });
      }
    } catch (error) {
      console.error("Update failed:", error);
      setIsUpdating(false);
    }
  };

  const currentUser = profile ?? storedUser;
  const userInitials = (currentUser?.name || currentUser?.email || "TR")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <section className="relative max-w-4xl mx-auto py-4 h-full">
      <PLine />
      <div className="px-4 md:px-6 py-6 relative border-b">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Settings
        </p>
        <h1 className="text-xl font-medium mt-1">Workspace configuration</h1>
        <PlusDecor />
      </div>

      <div className="border-border/60">
        <div className="px-4 md:px-6 py-6 relative border-b">
          <p className="text-sm font-medium mb-4">Profile</p>

          {currentUser ? (
            <div className="flex items-center gap-4">
              <Avatar data-size="lg">
                <AvatarImage src={currentUser.avatar_url} />
                <AvatarFallback>{userInitials || "TR"}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {currentUser.name || "Trackion User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentUser.email || "No email"}
                </p>

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Joined {moment(currentUser.created_at).fromNow()}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No profile available for this mode.
            </p>
          )}
          <PlusDecor />
        </div>

        <div className="px-4 md:px-6 py-6 relative border-b">
          <p className="text-sm font-medium mb-4">System</p>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Server Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    healthError ? "bg-red-500" : "bg-emerald-500"
                  }`}
                />
                <span className="text-foreground">
                  {healthLoading
                    ? "Checking..."
                    : healthError
                      ? "Down"
                      : "Operational"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground">Server Version</p>
              <p className="text-foreground mt-1">
                {health?.server_version || "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">App Version</p>
              <p className="text-foreground mt-1">{appVersion}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Operating System</p>
              <p className="text-foreground mt-1">
                {osType} {osVersion}
              </p>
            </div>
          </div>
          <PlusDecor />
        </div>

        {updateAvailable && (
          <div className="px-4 md:px-6 py-6 relative border-b bg-blue-50 dark:bg-blue-950/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2">Update Available</p>
                <p className="text-sm text-muted-foreground">
                  Version {updateVersion} is available.
                </p>
              </div>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium transition"
              >
                {isUpdating ? "Updating..." : "Update Now"}
              </button>
            </div>
            <PlusDecor />
          </div>
        )}

        <div className="px-4 md:px-6 py-6 border-b border-border/60">
          <p className="text-sm font-medium mb-4">Data & Privacy</p>

          <div className="space-y-2 text-sm text-muted-foreground max-w-xl">
            <p>
              All tracking data is stored on your server if using the
              self-hosted version.
              <br />
              On delete of projects or events, data is will delete permanently
              and cannot be recovered.
            </p>
          </div>
        </div>
        <div className="px-4 md:px-6 py-6 border-t border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Trackion. Built at P8labs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
