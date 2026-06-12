import { Switch, useMantineColorScheme } from "@mantine/core";
import { MoonIcon, SunIcon } from "lucide-react";

const ENABLED = false;

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  if (!ENABLED) {
    return null;
  }
  return (
    <Switch
      onClick={toggleColorScheme}
      value={colorScheme === "dark" ? "dark" : "light"}
      size="md"
      color="dark.4"
      onLabel={<SunIcon size={16} color="var(--mantine-color-yellow-4)" />}
      offLabel={<MoonIcon size={16} color="var(--mantine-color-blue-6)" />}
    />
  );
}
