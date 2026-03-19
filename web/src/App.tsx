import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { useStore } from "./store";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthPage } from "./pages/auth/AuthPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ProjectsPage } from "./pages/dashboard/ProjectsPage";
import { ProjectDetailPage } from "./pages/dashboard/ProjectDetailPage";
import { SettingsPage } from "./pages/dashboard/SettingsPage";
import { AuthCallbackPage } from "./pages/auth/AuthCallbackPage";
import { queryClient } from "./lib/queryClient";
import { LandingPage } from "./pages/landing/LandingPage";
import { AboutPage } from "./pages/landing/AboutPage";
import { TermsPage } from "./pages/landing/TermsPage";
import { PrivacyPage } from "./pages/landing/PrivacyPage";

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
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </RouteMiddleware>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
