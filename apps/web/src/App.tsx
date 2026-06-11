import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { ProjectDashboardLayout } from "@/components/layouts/project-dash";
import { ErrorBoundary } from "@/components/core/error-boundary";
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
import { Notifications } from "@mantine/notifications";

import { flags } from "@/lib/flags";
import { AppShell } from "./components/layouts/app-shell";
import { RouteMiddleware } from "./middleware";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
          <ModalsProvider>
            <Notifications position="top-left" />
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
          </ModalsProvider>
        </ErrorBoundary>
      </TrackionProvider>
    </QueryClientProvider>
  );
}

export default App;
