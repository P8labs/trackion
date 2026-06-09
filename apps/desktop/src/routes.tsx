import { Navigate } from "react-router-dom";
import { AuthPage } from "./pages/auth/AuthPage";
import { AuthCallbackPage } from "./pages/auth/AuthCallbackPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectsPage } from "./pages/projects/ProjectsPage";
import { CreateProjectPage } from "./pages/projects/CreateProjectPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { UsagePage } from "./pages/usage/UsagePage";
import { OverviewPage } from "./pages/projects/dashboard/OverviewPage";
import { EventsPage } from "./pages/projects/dashboard/EventsPage";
import { BreakdownPage } from "./pages/projects/dashboard/BreakdownPage";
import { RealtimePage } from "./pages/projects/dashboard/RealtimePage";
import { SessionReplayPage } from "./pages/projects/replay/SessionReplayPage";
import { ProjectDetailPage } from "./pages/projects/ProjectDetailPage";
import { RemoteConfigPage } from "./pages/projects/RemoteConfigPage";
import { ErrorListPage } from "./pages/projects/errors/ErrorListPage";
import { ErrorDetailPage } from "./pages/projects/errors/ErrorDetailPage";
import { CogIcon, FolderIcon } from "@hugeicons/core-free-icons";
import { ChartPieIcon } from "lucide-react";

export const workspaceRoutes = [
  { path: "/", element: <ProjectsPage /> },
  { path: "/projects", element: <ProjectsPage /> },
  { path: "/projects/new", element: <CreateProjectPage /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/usage", element: <UsagePage /> },
  { path: "*", element: <NotFoundPage /> },
];

export const projectRoutes = [
  {
    path: "/projects/:id",
    element: <Navigate to="overview" replace />,
  },
  { path: "/projects/:id/overview", element: <OverviewPage /> },
  { path: "/projects/:id/events", element: <EventsPage /> },
  { path: "/projects/:id/breakdown", element: <BreakdownPage /> },
  { path: "/projects/:id/realtime", element: <RealtimePage /> },
  { path: "/projects/:id/replays", element: <SessionReplayPage /> },
  { path: "/projects/:id/settings", element: <ProjectDetailPage /> },
  { path: "/projects/:id/remote-config", element: <RemoteConfigPage /> },
  { path: "/projects/:id/errors", element: <ErrorListPage /> },
  { path: "/projects/:id/errors/:fingerprint", element: <ErrorDetailPage /> },
];

export const authRoutes = [
  { path: "/auth", element: <AuthPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
];

export const workspaceLinks = [
  { path: "/projects", name: "Projects", icon: FolderIcon },
  { path: "/usage", name: "Usage", icon: ChartPieIcon },
  { path: "/settings", name: "Settings", icon: CogIcon },
];
