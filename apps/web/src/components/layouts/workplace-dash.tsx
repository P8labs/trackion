import { ChartPieIcon, CogIcon, FolderIcon } from "lucide-react";
import { AppShell } from "./app-shell";

const links = [
  { path: "/projects", name: "Projects", icon: FolderIcon },
  { path: "/usage", name: "Usage", icon: ChartPieIcon },
  { path: "/settings", name: "Settings", icon: CogIcon },
];

export function ProjectsWorkspaceLayout() {
  return <AppShell links={links} />;
}
