import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Suspense } from "react";
import { useStore } from "./store";
import Loader from "./Loader";
import { QueryClientProvider } from "@tanstack/react-query";
import { authRoutes, projectRoutes, workspaceRoutes } from "./routes";
import { queryClient } from "./lib/queryClient";
import { useDeepLinkAuth } from "./hooks/use-deeplink";
import { ErrorBoundary } from "./components/core/error-boundary";
import { ThemeProvider } from "@trackion/ui/theme-toggle";
import { ProjectsWorkspaceLayout } from "./components/layouts/workplace-dash";
import { ProjectDashboardLayout } from "./components/layouts/project-dash";
import { Layout } from "./components/layouts/base";
import { GlobalProvider } from "./providers/global-provider";

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
    <GlobalProvider>
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
    </GlobalProvider>
  );
}

export default App;
