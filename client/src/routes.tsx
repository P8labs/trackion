import { lazy } from "react";
import { Navigate } from "react-router-dom";
import DownloadsPage from "./pages/landing/DownloadsPage";
import {
  BugIcon,
  ChartPieIcon,
  CogIcon,
  Columns3CogIcon,
  FolderIcon,
  LayoutDashboardIcon,
  TrendingUpIcon,
  TvMinimalIcon,
  type LucideIcon,
} from "lucide-react";

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

export const RouteGroup = {
  authentication: "authentication",
  workspace: "workspace",
  project: "project",
  public: "public",
} as const;

export const LinkedSidebar = {
  workspace: "workspace",
  project: "project",
} as const;

export type RouteGroup = (typeof RouteGroup)[keyof typeof RouteGroup];
export type LinkedSidebar = (typeof LinkedSidebar)[keyof typeof LinkedSidebar];

export type AppRoute = {
  path: string;
  element: React.ReactNode;
  icon?: LucideIcon;
  group: RouteGroup;
  linkedSidebar?: LinkedSidebar;
  meta?: {
    showBackButton?: boolean;
    name?: string;
    showHeader?: boolean;
  };
};

export const allRoutes: AppRoute[] = [
  {
    path: "/auth",
    element: <Navigate to="/auth/signin" replace />,
    group: "authentication",
  },
  {
    path: "/auth/signin",
    element: <AuthSignInPage />,
    group: "authentication",
    meta: { showHeader: false },
  },
  {
    path: "/auth/signup",
    element: <AuthSignUpPage />,
    group: "authentication",
    meta: { showHeader: false },
  },
  {
    path: "/auth/email/verify",
    element: <AuthEmailVerifyPage />,
    group: "authentication",
    meta: { showBackButton: true },
  },
  {
    path: "/auth/email/recovery",
    element: <AuthEmailRecoveryPage />,
    group: "authentication",
    meta: { showBackButton: true },
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
    group: "authentication",
    meta: { showHeader: false },
  },
  { path: "/subscribe", element: <SubscribePage />, group: "authentication" },
  {
    path: "/projects",
    element: <ProjectsPage />,
    icon: FolderIcon,
    group: "workspace",
    linkedSidebar: "workspace",
    meta: { name: "Projects" },
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    icon: CogIcon,
    group: "workspace",
    linkedSidebar: "workspace",
    meta: { name: "Settings" },
  },
  {
    path: "/subscriptions",
    element: <SubscriptionsPage />,
    icon: ChartPieIcon,
    group: "workspace",
    linkedSidebar: "workspace",
    meta: { name: "Subscriptions" },
  },
  {
    path: "/projects/:id/realtime",
    element: <Navigate to="/projects/:id/events" />,
    icon: LayoutDashboardIcon,
    group: "project",
  },
  {
    path: "/projects/:id",
    element: <Navigate to="/projects/:id/overview" />,
    icon: FolderIcon,
    group: "project",
  },
  {
    path: "/projects/:id/overview",
    element: <OverviewPage />,
    icon: LayoutDashboardIcon,
    group: "project",
    meta: { name: "Overview" },
    linkedSidebar: "project",
  },
  {
    path: "/projects/:id/events",
    element: <EventsPage />,
    icon: TrendingUpIcon,
    group: "project",
    linkedSidebar: "project",
    meta: { name: "Real-time Events" },
  },
  {
    path: "/projects/:id/breakdown",
    element: <BreakdownPage />,
    icon: ChartPieIcon,
    group: "project",
    linkedSidebar: "project",
    meta: { name: "Breakdown" },
  },
  {
    path: "/projects/:id/replays",
    element: <SessionReplayPage />,
    icon: TvMinimalIcon,
    group: "project",
    linkedSidebar: "project",
    meta: { name: "Session Replays" },
  },
  {
    path: "/projects/:id/remote-config",
    element: <RemoteConfigPage />,
    icon: Columns3CogIcon,
    group: "project",
    linkedSidebar: "project",
    meta: { name: "Remote Config" },
  },
  {
    path: "/projects/:id/errors",
    element: <ErrorListPage />,
    icon: BugIcon,
    linkedSidebar: "project",
    meta: { name: "Errors" },
    group: "project",
  },
  {
    path: "/projects/:id/settings",
    element: <ProjectDetailPage />,
    icon: CogIcon,
    group: "project",
    meta: { name: "Project Settings" },
    linkedSidebar: "project",
  },
  {
    path: "/projects/:id/errors/:fingerprint",
    element: <ErrorDetailPage />,
    icon: BugIcon,
    meta: { showBackButton: true },
    group: "project",
  },
  { path: "/", element: <LandingPage />, group: "public" },
  { path: "/downloads", element: <DownloadsPage />, group: "public" },
  { path: "/about", element: <AboutPage />, group: "public" },
  { path: "/terms", element: <TermsPage />, group: "public" },
  { path: "/privacy", element: <PrivacyPage />, group: "public" },
  { path: "*", element: <NotFoundPage />, group: "public" },
];

export const authRoutes = allRoutes.filter((r) => r.group === "authentication");
export const workspaceRoutes = allRoutes.filter((r) => r.group === "workspace");
export const projectRoutes = allRoutes.filter((r) => r.group === "project");
export const publicRoutes = allRoutes.filter((r) => r.group === "public");

export const workspaceLinks = [
  { path: "/projects", name: "Projects", icon: FolderIcon },
  { path: "/subscriptions", name: "Subscriptions", icon: ChartPieIcon },
  { path: "/settings", name: "Settings", icon: CogIcon },
];

export const projectLinks = allRoutes
  .filter((r) => r.linkedSidebar === "project")
  .map((r) => ({
    path: r.path,
    name: r.meta?.name || r.path.split("/").slice(-1)[0],
    icon: r.icon,
  }));
