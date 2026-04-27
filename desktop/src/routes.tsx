import { AuthPage } from "./pages/auth/AuthPage";
import { AuthCallbackPage } from "./pages/auth/AuthCallbackPage";
import { ProjectsPage } from "./pages/dashboard/ProjectsPage";
import { CreateProjectPage } from "./pages/dashboard/CreateProjectPage";
import { SettingsPage } from "./pages/dashboard/SettingsPage";
import { UsagePage } from "./pages/dashboard/UsagePage";
import { Navigate } from "react-router-dom";
import { OverviewPage } from "./pages/dashboard/OverviewPage";
import { EventsPage } from "./pages/dashboard/EventsPage";
import { BreakdownPage } from "./pages/dashboard/BreakdownPage";
import { RealtimePage } from "./pages/dashboard/RealtimePage";
import { SessionReplayPage } from "./pages/dashboard/SessionReplayPage";
import { ProjectDetailPage } from "./pages/dashboard/ProjectDetailPage";
import { RemoteConfigPage } from "./pages/dashboard/RemoteConfigPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ErrorListPage } from "./pages/errors/ErrorListPage";
import { ErrorDetailPage } from "./pages/errors/ErrorDetailPage";

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
