import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { ProjectDashboardLayout } from "@/components/layouts/project-dash";

import { ErrorBoundary } from "@/components/core/error-boundary";

import { ThemeProvider } from "@trackion/ui/theme-toggle";
import { queryClient } from "@/lib/queryClient";
import { Loader } from "@trackion/ui/loader";

import { ModalsProvider } from "@mantine/modals";
import { TrackionProvider } from "@trackion/js/react";
import {
  authRoutes,
  projectRoutes,
  publicRoutes,
  workspaceRoutes,
  workspaceLinks,
} from "./routes";

import { flags } from "@/lib/flags";
import { useGlobalStore } from "@/store";
import { AppShell } from "./components/layouts/app-shell";

const protectedRoutePrefixes = ["/projects", "/settings", "/usage"];
const publicOnlyRoutes = new Set(["/auth"]);

function RouteMiddleware({ children }: { children: React.ReactNode }) {
  const { authToken } = useGlobalStore();
  const location = useLocation();
  const isLoggedIn = !!authToken;

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
        enabled: false,
        apiKey: flags.trackionToken,
        serverUrl: flags.trackionUrl,
        replay: {
          enabled: false,
        },
      }}
    >
      <ErrorBoundary>
        <ThemeProvider defaultTheme="dark">
          <ModalsProvider>
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

                      <Route element={<AppShell links={workspaceLinks} />}>
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
          </ModalsProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </TrackionProvider>
  );
}

export default App;
