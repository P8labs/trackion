import { lazy } from "react";
import { Navigate } from "react-router-dom";
import DownloadsPage from "./pages/landing/DownloadsPage";
import { ChartPieIcon, CogIcon, FolderIcon } from "lucide-react";

const AuthSignInPage = lazy(() =>
  import("./pages/auth/AuthSignInPage").then((m) => ({
    default: m.AuthSignInPage,
  })),
);

const SubscribePage = lazy(() =>
  import("./pages/subscriptions/SubscribePage").then((m) => ({
    default: m.SubscribePage,
  })),
);

const SubscriptionsPage = lazy(() =>
  import("./pages/subscriptions/SubscriptionsPage").then((m) => ({
    default: m.SubscriptionsPage,
  })),
);

const AuthSignUpPage = lazy(() =>
  import("./pages/auth/AuthSignUpPage").then((m) => ({
    default: m.AuthSignUpPage,
  })),
);
const AuthEmailVerifyPage = lazy(() =>
  import("./pages/auth/AuthEmailVerifyPage").then((m) => ({
    default: m.AuthEmailVerifyPage,
  })),
);
const AuthEmailRecoveryPage = lazy(() =>
  import("./pages/auth/AuthEmailRecoveryPage").then((m) => ({
    default: m.AuthEmailRecoveryPage,
  })),
);
const AuthCallbackPage = lazy(() =>
  import("./pages/auth/AuthCallbackPage").then((m) => ({
    default: m.AuthCallbackPage,
  })),
);
const OverviewPage = lazy(() =>
  import("./pages/projects/dashboard/OverviewPage").then((m) => ({
    default: m.OverviewPage,
  })),
);
const EventsPage = lazy(() =>
  import("./pages/projects/dashboard/EventsPage").then((m) => ({
    default: m.EventsPage,
  })),
);
const BreakdownPage = lazy(() =>
  import("./pages/projects/dashboard/BreakdownPage").then((m) => ({
    default: m.BreakdownPage,
  })),
);

const SessionReplayPage = lazy(() =>
  import("./pages/projects/replay/SessionReplayPage").then((m) => ({
    default: m.SessionReplayPage,
  })),
);
const ProjectsPage = lazy(() =>
  import("./pages/projects/ProjectsPage").then((m) => ({
    default: m.ProjectsPage,
  })),
);
const ProjectDetailPage = lazy(() =>
  import("./pages/projects/ProjectDetailPage").then((m) => ({
    default: m.ProjectDetailPage,
  })),
);
const RemoteConfigPage = lazy(() =>
  import("./pages/projects/RemoteConfigPage").then((m) => ({
    default: m.RemoteConfigPage,
  })),
);

const SettingsPage = lazy(() =>
  import("./pages/settings/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);

const ErrorListPage = lazy(() =>
  import("./pages/projects/errors/ErrorListPage").then((m) => ({
    default: m.ErrorListPage,
  })),
);
const ErrorDetailPage = lazy(() =>
  import("./pages/projects/errors/ErrorDetailPage").then((m) => ({
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
  { path: "/settings", element: <SettingsPage /> },
  { path: "/subscriptions", element: <SubscriptionsPage /> },
];

export const projectRoutes = [
  { path: "overview", element: <OverviewPage /> },
  { path: "events", element: <EventsPage /> },
  { path: "breakdown", element: <BreakdownPage /> },
  {
    path: "realtime",
    element: <Navigate to="../events" />,
  },
  { path: "replays", element: <SessionReplayPage /> },
  { path: "settings", element: <ProjectDetailPage /> },
  { path: "remote-config", element: <RemoteConfigPage /> },
  { path: "errors", element: <ErrorListPage /> },
  { path: "errors/:fingerprint", element: <ErrorDetailPage /> },
];

export const publicRoutes = [
  { path: "/", element: <LandingPage /> },
  { path: "/downloads", element: <DownloadsPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
  { path: "*", element: <NotFoundPage /> },
];

export const authRoutes = [
  { path: "/auth", element: <Navigate to="/auth/signin" replace /> },
  { path: "/auth/signin", element: <AuthSignInPage /> },
  { path: "/auth/signup", element: <AuthSignUpPage /> },
  { path: "/auth/email/verify", element: <AuthEmailVerifyPage /> },
  { path: "/auth/email/recovery", element: <AuthEmailRecoveryPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
  { path: "/subscribe", element: <SubscribePage /> },
];

export const workspaceLinks = [
  { path: "/projects", name: "Projects", icon: FolderIcon },
  { path: "/subscriptions", name: "Subscriptions", icon: ChartPieIcon },
  { path: "/settings", name: "Settings", icon: CogIcon },
];
