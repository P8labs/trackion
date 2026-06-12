import { IsDesktop } from "@/lib/flags";
import { ActionIcon, Group, Text } from "@mantine/core";
import { Maximize2, Minus, RefreshCw, X } from "lucide-react";

export default function TitleBar() {
  const onAction = async (action: "min" | "max" | "close") => {
    if (IsDesktop()) {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("handle_window_action", { action });
    }
  };

  return (
    <header
      data-tauri-drag-region
      className="sticky top-0 z-50 h-10 min-h-10 shrink-0 flex items-center justify-between pl-4 pr-1 -mb-10"
    >
      <Group gap="xs" data-tauri-drag-region>
        <Text fw={600} size="sm">
          Trackion
        </Text>

        <Text size="xs" c="dimmed">
          Desktop
        </Text>
      </Group>
      <Group gap={2} data-tauri-drag-region={false}>
        <ActionIcon
          data-tauri-drag-region={false}
          variant="subtle"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={14} />
        </ActionIcon>

        <ActionIcon
          data-tauri-drag-region={false}
          variant="subtle"
          onClick={() => onAction("min")}
        >
          <Minus size={14} />
        </ActionIcon>

        <ActionIcon
          data-tauri-drag-region={false}
          variant="subtle"
          onClick={() => onAction("max")}
        >
          <Maximize2 size={14} />
        </ActionIcon>

        <ActionIcon
          data-tauri-drag-region={false}
          color="red"
          variant="subtle"
          onClick={() => onAction("close")}
        >
          <X size={14} />
        </ActionIcon>
      </Group>
    </header>
  );
}
