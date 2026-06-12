import { useEffect, useState } from "react";
import { IsWeb } from "@/lib/flags";
import { Button, Group, Text, Divider } from "@mantine/core";

export default function Updater() {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const update = await check();

        if (update) {
          setUpdateAvailable(true);
          setUpdateVersion(update.version);
        }
      } catch (error) {
        console.error("Failed to check for updates:", error);
      }
    };

    if (!IsWeb()) {
      checkUpdate();
    }
  }, []);

  const handleUpdate = async () => {
    if (IsWeb()) return;

    try {
      setIsUpdating(true);
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();

      if (update) {
        await update.downloadAndInstall((e) => {
          console.log("Update progress:", e.event);
        });
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      // Typically, Tauri apps restart after a successful update,
      // but if it fails or completes without restart, we stop loading here.
      setIsUpdating(false);
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <>
      <div className="p-5 md:p-6">
        <Group justify="space-between" align="center">
          <div>
            <Text size="sm" fw={600} c="blue">
              Software Update Available
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Version {updateVersion} is ready to be installed.
            </Text>
          </div>

          <Button
            onClick={handleUpdate}
            loading={isUpdating}
            variant="gradient"
            radius="md"
          >
            Update Now
          </Button>
        </Group>
      </div>
      <Divider />
    </>
  );
}
