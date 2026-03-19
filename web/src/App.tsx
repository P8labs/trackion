import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
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
import { queryClient, setGlobalErrorHandler } from "./lib/queryClient";
import { LandingPage } from "./pages/landing/LandingPage";
import { DocsPage } from "./pages/landing/DocsPage";
import { AboutPage } from "./pages/landing/AboutPage";
import { TermsPage } from "./pages/landing/TermsPage";
import { PrivacyPage } from "./pages/landing/PrivacyPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authToken } = useStore();

  if (!isAuthenticated || !authToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AuthRoute() {
  const { isAuthenticated } = useStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <AuthPage />;
}

function App() {
  const { logout } = useStore();

  useEffect(() => {
    setGlobalErrorHandler((error) => {
      if (
        error.message.includes("401") ||
        error.message.includes("403") ||
        error.message.includes("Unauthorized") ||
        error.message.includes("Forbidden")
      ) {
        console.log("Authentication error detected, logging out user");
        logout();
      }
    });
  }, [logout]);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              <Route path="/auth" element={<AuthRoute />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectDetailPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SettingsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
