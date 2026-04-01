import { lazy } from "react";

const AuthPage = lazy(() =>
  import("./pages/auth/AuthPage").then((m) => ({ default: m.AuthPage })),
);
const AuthCallbackPage = lazy(() =>
  import("./pages/auth/AuthCallbackPage").then((m) => ({
    default: m.AuthCallbackPage,
  })),
);
const DashboardPage = lazy(() =>
  import("./pages/dashboard/OverviewPage").then((m) => ({
    default: m.OverviewPage,
  })),
);
const ProjectsPage = lazy(() =>
  import("./pages/dashboard/ProjectsPage").then((m) => ({
    default: m.ProjectsPage,
  })),
);
const ProjectDetailPage = lazy(() =>
  import("./pages/dashboard/ProjectDetailPage").then((m) => ({
    default: m.ProjectDetailPage,
  })),
);
const CreateProjectPage = lazy(() =>
  import("./pages/dashboard/CreateProjectPage").then((m) => ({
    default: m.CreateProjectPage,
  })),
);
const SettingsPage = lazy(() =>
  import("./pages/dashboard/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);
const UsagePage = lazy(() =>
  import("./pages/dashboard/UsagePage").then((m) => ({
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
  { path: "/projects/:id", element: <DashboardPage /> },
  { path: "/projects/:id/settings", element: <ProjectDetailPage /> },
  { path: "/projects/:id/errors", element: <ErrorListPage /> },
  { path: "/projects/:id/errors/:fingerprint", element: <ErrorDetailPage /> },
];

export const publicRoutes = [
  { path: "/", element: <LandingPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
];

export const authRoutes = [
  { path: "/auth", element: <AuthPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
];
