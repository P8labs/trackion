import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { useStore } from "./store";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";
import { queryClient } from "./lib/queryClient";
import Loader from "./Loader";

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

const protectedRoutePrefixes = ["/dashboard", "/projects", "/settings"];
const publicOnlyRoutes = new Set(["/auth"]);

function RouteMiddleware({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, authToken } = useStore();
  const isLoggedIn = isAuthenticated && !!authToken;

  const isProtectedRoute = protectedRoutePrefixes.some((prefix) =>
    location.pathname.startsWith(prefix),
  );

  if (!isLoggedIn && isProtectedRoute) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (isLoggedIn && publicOnlyRoutes.has(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <RouteMiddleware>
              <Suspense fallback={<Loader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />

                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />

                  <Route
                    path="/dashboard"
                    element={
                      <Layout>
                        <DashboardPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/projects"
                    element={
                      <Layout>
                        <ProjectsPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/projects/new"
                    element={
                      <Layout>
                        <CreateProjectPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/projects/:id"
                    element={
                      <Layout>
                        <ProjectDetailPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/errors"
                    element={
                      <Layout>
                        <ErrorListPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/errors/:fingerprint"
                    element={
                      <Layout>
                        <ErrorDetailPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </Suspense>
            </RouteMiddleware>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
