import { ActionIcon, Group, Text } from "@mantine/core";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppBarProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function AppBar({ title, description, actions }: AppBarProps) {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 1;

  return (
    <header className="sticky top-0 z-50 h-12 shrink-0 border-b border-(--mantine-color-default-border) bg-(--mantine-color-body)/80 backdrop-blur-md">
      <div
        className="h-full flex items-center justify-between px-4"
        data-tauri-drag-region
      >
        <Group gap="sm">
          {canGoBack && (
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => navigate(-1)}
              data-tauri-drag-region={undefined}
            >
              <ArrowLeftIcon size={18} />
            </ActionIcon>
          )}

          <div>
            <Text fw={600} size="sm">
              {title}
            </Text>

            {description && (
              <Text size="xs" c="dimmed">
                {description}
              </Text>
            )}
          </div>
        </Group>

        {actions && (
          <Group gap="xs" data-tauri-drag-region={undefined}>
            {actions}
          </Group>
        )}
      </div>
    </header>
  );
}
