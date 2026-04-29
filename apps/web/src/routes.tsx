import { lazy } from "react";
import { Navigate } from "react-router-dom";
import DownloadsPage from "./pages/landing/DownloadsPage";

const AuthPage = lazy(() =>
  import("./pages/auth/AuthPage").then((m) => ({ default: m.AuthPage })),
);
const AuthCallbackPage = lazy(() =>
  import("./pages/auth/AuthCallbackPage").then((m) => ({
    default: m.AuthCallbackPage,
  })),
);
const OverviewPage = lazy(() =>
  import("./pages/dashboard/OverviewPage").then((m) => ({
    default: m.OverviewPage,
  })),
);
const EventsPage = lazy(() =>
  import("./pages/dashboard/EventsPage").then((m) => ({
    default: m.EventsPage,
  })),
);
const BreakdownPage = lazy(() =>
  import("./pages/dashboard/BreakdownPage").then((m) => ({
    default: m.BreakdownPage,
  })),
);
const RealtimePage = lazy(() =>
  import("./pages/dashboard/RealtimePage").then((m) => ({
    default: m.RealtimePage,
  })),
);
const SessionReplayPage = lazy(() =>
  import("./pages/dashboard/SessionReplayPage").then((m) => ({
    default: m.SessionReplayPage,
  })),
);
const ProjectsPage = lazy(() =>
  import("./pages/projects/ProjectsPage").then((m) => ({
    default: m.ProjectsPage,
  })),
);
const ProjectDetailPage = lazy(() =>
  import("./pages/dashboard/ProjectDetailPage").then((m) => ({
    default: m.ProjectDetailPage,
  })),
);
const RemoteConfigPage = lazy(() =>
  import("./pages/dashboard/RemoteConfigPage").then((m) => ({
    default: m.RemoteConfigPage,
  })),
);
const CreateProjectPage = lazy(() =>
  import("./pages/projects/CreateProjectPage").then((m) => ({
    default: m.CreateProjectPage,
  })),
);
const SettingsPage = lazy(() =>
  import("./pages/settings/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);
const UsagePage = lazy(() =>
  import("./pages/usage/UsagePage").then((m) => ({
    default: m.UsagePage,
  })),
);
const ErrorListPage = lazy(() =>
  import("./pages/errors/ErrorListPage").then((m) => ({
    default: m.ErrorListPage,
  })),
);
const ErrorDetailPage = lazy(() =>
  import("./pages/errors/ErrorDetailPage").then((m) => ({
    default: m.ErrorDetailPage,
  })),
);
const LandingPage = lazy(() =>
  import("./pages/landing/LandingPage").then((m) => ({
    default: m.LandingPage,
  })),
);
const AboutPage = lazy(() =>
  import("./pages/landing/AboutPage").then((m) => ({
    default: m.AboutPage,
  })),
);
const TermsPage = lazy(() =>
  import("./pages/landing/TermsPage").then((m) => ({
    default: m.TermsPage,
  })),
);
const PrivacyPage = lazy(() =>
  import("./pages/landing/PrivacyPage").then((m) => ({
    default: m.PrivacyPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);

export const workspaceRoutes = [
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

export const publicRoutes = [
  { path: "/", element: <LandingPage /> },
  { path: "/downloads", element: <DownloadsPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
];

export const authRoutes = [
  { path: "/auth", element: <AuthPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
];
