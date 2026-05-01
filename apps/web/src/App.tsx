import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { ProjectsWorkspaceLayout } from "@/components/layouts/workplace-dash";
import { ProjectDashboardLayout } from "@/components/layouts/project-dash";

import { ErrorBoundary } from "@/components/core/error-boundary";
import { GlobalProvider } from "@/providers/global-provider";

import { ThemeProvider } from "@trackion/ui/theme-toggle";
import { queryClient } from "@/lib/queryClient";
import { Loader } from "@trackion/ui/loader";

import { TrackionProvider } from "@trackion/js/react";
import {
  authRoutes,
  projectRoutes,
  publicRoutes,
  workspaceRoutes,
} from "./routes";

import { flags } from "@/lib/flags";
import { useStore } from "@/store";

const protectedRoutePrefixes = ["/projects", "/settings", "/usage"];
const publicOnlyRoutes = new Set(["/auth"]);

function RouteMiddleware({ children }: { children: React.ReactNode }) {
  const { authToken, isAuthenticated } = useStore();
  const location = useLocation();
  const isLoggedIn = isAuthenticated && !!authToken;

  const isProtectedRoute = protectedRoutePrefixes.some((prefix) =>
    location.pathname.startsWith(prefix),
  );

  if (!isLoggedIn && isProtectedRoute) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (isLoggedIn && publicOnlyRoutes.has(location.pathname)) {
    return <Navigate to="/projects" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <GlobalProvider>
      <TrackionProvider
        options={{
          enabled: true,
          apiKey: flags.trackionToken,
          serverUrl: flags.trackionUrl,
          replay: {
            enabled: true,
          },
        }}
      >
        <ErrorBoundary>
          <ThemeProvider defaultTheme="dark">
            <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                <RouteMiddleware>
                  <Suspense fallback={<Loader />}>
                    <Routes>
                      <Route>
                        {publicRoutes.map((r) => (
                          <Route key={r.path} {...r} />
                        ))}
                      </Route>
                      <Route>
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
      </TrackionProvider>
    </GlobalProvider>
  );
}

export default App;
