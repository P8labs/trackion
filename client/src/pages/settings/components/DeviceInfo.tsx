import { IsWeb } from "@/lib/flags";
import { SimpleGrid, Text } from "@mantine/core";
import { useEffect, useState } from "react";

export default function DeviceInfo() {
  const [clientSpecs, setClientSpecs] = useState({
    device: "Loading...",
    os: "Loading...",
    resolution: "Loading...",
    timezone: "Loading...",
  });

  useEffect(() => {
    const loadClientSpecs = async () => {
      const ua = navigator.userAgent;

      let device = "Unknown Browser";
      let os = "Unknown OS";

      if (!IsWeb()) {
        try {
          const { platform, version, arch } =
            await import("@tauri-apps/plugin-os");

          const osType = platform();
          const osVersion = version();
          const architecture = arch();

          device = `${osType} ${osVersion} (${architecture})`;
          os = osType;
        } catch (error) {
          console.error("Failed to load OS info:", error);
        }
      } else {
        if (ua.includes("Firefox")) device = "Mozilla Firefox";
        else if (ua.includes("SamsungBrowser")) device = "Samsung Internet";
        else if (ua.includes("Opera") || ua.includes("OPR")) device = "Opera";
        else if (ua.includes("Edge") || ua.includes("Edg"))
          device = "Microsoft Edge";
        else if (ua.includes("Chrome")) device = "Google Chrome";
        else if (ua.includes("Safari")) device = "Apple Safari";

        if (ua.includes("Win")) os = "Windows";
        else if (ua.includes("Mac")) os = "macOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("like Mac")) os = "iOS";
      }

      setClientSpecs({
        device,
        os,
        resolution: `${window.screen.width} x ${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    };

    loadClientSpecs();
  }, []);

  return (
    <div className="p-5 md:p-6 bg-muted/10">
      <Text size="sm" fw={600} mb="md">
        Client Environment
      </Text>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
        <div>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed">
            Operating System
          </Text>
          <Text mt="xs" size="sm" fw={500}>
            {clientSpecs.os}
          </Text>
        </div>

        <div>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed">
            Device
          </Text>
          <Text mt="xs" size="sm" fw={500}>
            {clientSpecs.device}
          </Text>
        </div>

        <div>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed">
            Resolution
          </Text>
          <Text mt="xs" size="sm" fw={500}>
            {clientSpecs.resolution}
          </Text>
        </div>

        <div>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed">
            Timezone
          </Text>
          <Text mt="xs" size="sm" fw={500}>
            {clientSpecs.timezone}
          </Text>
        </div>
      </SimpleGrid>
    </div>
  );
}
