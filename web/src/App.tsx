import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { useStore } from "./store";
import { ProjectDashboardLayout } from "./components/ProjectDashboardLayout";
import { ProjectsWorkspaceLayout } from "./pages/dashboard/components/ProjectsWorkspaceLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";
import { queryClient } from "./lib/queryClient";
import Loader from "./Loader";
import { TrackionProvider } from "@trackion/js/react";
import { flags } from "./lib/flags";

import {
  authRoutes,
  projectRoutes,
  publicRoutes,
  workspaceRoutes,
} from "./routes";

const protectedRoutePrefixes = ["/projects", "/settings", "/usage"];
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
    return <Navigate to="/projects" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <TrackionProvider
      options={{
        serverUrl: flags.trackionUrl,
        apiKey: flags.trackionToken,
        autoPageview: true,
        batchSize: 10,
        flushIntervalMs: 3000,
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
  );
}

export default App;
