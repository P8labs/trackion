import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Suspense } from "react";
import "./App.css";
import { useStore } from "./store";
import Loader from "./Loader";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";
import { authRoutes, projectRoutes, workspaceRoutes } from "./routes";
import { queryClient } from "./lib/queryClient";
import { useDeepLinkAuth } from "./hooks/deeplink";
import { ProjectsWorkspaceLayout } from "./pages/dashboard/components/ProjectsWorkspaceLayout";
import { ProjectDashboardLayout } from "./pages/dashboard/components/ProjectDashboardLayout";
import { Layout } from "./components/Layout";

function RouteMiddleware({ children }: { children: React.ReactNode }) {
  useDeepLinkAuth();
  const location = useLocation();

  const { isAuthenticated, authToken } = useStore();
  const isLoggedIn = isAuthenticated && !!authToken;

  const publicPaths = ["/auth", "/auth/callback"];

  if (!isLoggedIn && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <div className="no-scrollbar!">{children}</div>;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <RouteMiddleware>
              <Suspense fallback={<Loader />}>
                <Routes>
                  <Route element={<Layout />}>
                    {authRoutes.map((r) => (
                      <Route key={r.path} {...r} />
                    ))}
                  </Route>
                  <Route element={<ProjectsWorkspaceLayout />}>
                    {workspaceRoutes.map((r) => (
                      <Route key={r.path} {...r} />
                    ))}
                  </Route>

                  <Route element={<ProjectDashboardLayout />}>
                    {projectRoutes.map((r) => (
                      <Route key={r.path} {...r} />
                    ))}
                  </Route>
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
