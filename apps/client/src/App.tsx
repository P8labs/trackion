import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import {
  authRoutes,
  projectRoutes,
  publicRoutes,
  workspaceRoutes,
  workspaceLinks,
  projectLinks,
} from "./routes";

import { IsDesktop } from "@/lib/flags";
import { AppShell } from "./components/layouts/app-shell";
import { RouteMiddleware } from "./middleware";
import { LoadingView } from "./Loader";
import TitleBar from "./components/core/title-bar";

function App() {
  return (
    <Suspense fallback={<LoadingView />}>
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        {IsDesktop() && (
          <div className="shrink-0">
            <TitleBar />
          </div>
        )}

        <main className="flex-1 min-h-0 overflow-auto">
          <BrowserRouter>
            <RouteMiddleware>
              <Routes>
                <Route
                  element={
                    <AppShell showHeader minimalHeader showSidebar={false} />
                  }
                >
                  {authRoutes.map((r) => (
                    <Route key={r.path} {...r} />
                  ))}
                </Route>

                <Route element={<AppShell links={workspaceLinks} />}>
                  {workspaceRoutes.map((r) => (
                    <Route key={r.path} {...r} />
                  ))}
                </Route>
                <Route element={<AppShell links={projectLinks} />}>
                  {projectRoutes.map((r) => (
                    <Route key={r.path} {...r} />
                  ))}
                </Route>

                <Route>
                  {publicRoutes.map((r) => (
                    <Route key={r.path} {...r} />
                  ))}
                </Route>
              </Routes>
            </RouteMiddleware>
          </BrowserRouter>
        </main>
      </div>
    </Suspense>
  );
}

export default App;
