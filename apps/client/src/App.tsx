import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { ProjectDashboardLayout } from "@/components/layouts/project-dash";
import { ErrorBoundary } from "@/components/core/error-boundary";
import { queryClient } from "@/lib/queryClient";

import { ModalsProvider } from "@mantine/modals";
import {
  authRoutes,
  projectRoutes,
  publicRoutes,
  workspaceRoutes,
  workspaceLinks,
} from "./routes";
import { Notifications } from "@mantine/notifications";
import {
  CodeHighlightAdapterProvider,
  createHighlightJsAdapter,
} from "@mantine/code-highlight";

import { IsDesktop } from "@/lib/flags";
import { AppShell } from "./components/layouts/app-shell";
import { RouteMiddleware } from "./middleware";
import { LoadingView } from "./Loader";
import TitleBar from "./components/core/title-bar";

import "highlight.js/styles/dark.min.css";

import hljs from "highlight.js/lib/core";
import tsLang from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";

hljs.registerLanguage("typescript", tsLang);
hljs.registerLanguage("json", json);
hljs.registerLanguage("html", xml);
const highlightJsAdapter = createHighlightJsAdapter(hljs);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <CodeHighlightAdapterProvider adapter={highlightJsAdapter}>
          <ModalsProvider>
            <Notifications position="top-left" />

            <div className="h-screen w-screen flex flex-col overflow-hidden">
              {IsDesktop() && (
                <div className="shrink-0">
                  <TitleBar />
                </div>
              )}

              <main className="flex-1 min-h-0 overflow-auto">
                <BrowserRouter>
                  <RouteMiddleware>
                    <Suspense fallback={<LoadingView />}>
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
                          <Route path="/projects/:id">
                            <Route
                              index
                              element={<Navigate to="overview" replace />}
                            />
                            {projectRoutes.map((r) => (
                              <Route key={r.path} {...r} />
                            ))}
                          </Route>
                        </Route>
                      </Routes>
                    </Suspense>
                  </RouteMiddleware>
                </BrowserRouter>
              </main>
            </div>
          </ModalsProvider>
        </CodeHighlightAdapterProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
