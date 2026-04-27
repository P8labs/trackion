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
import { authRoutes } from "./routes";
import { queryClient } from "./lib/queryClient";
import { useDeepLinkAuth } from "./hooks/deeplink";

function RouteMiddleware({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const toLocation = useDeepLinkAuth();
  console.log("toLocation", toLocation);
  const { isAuthenticated, authToken } = useStore();
  const isLoggedIn = isAuthenticated && !!authToken;

  if (!isLoggedIn && !authRoutes.some((r) => r.path === location.pathname)) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
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
                  <Route>
                    {authRoutes.map((r) => (
                      <Route key={r.path} {...r} />
                    ))}
                  </Route>

                  {/* <Route element={<ProjectsWorkspaceLayout />}>
                    {workspaceRoutes.map((r) => (
                      <Route key={r.path} {...r} />
                    ))}
                  </Route>

                  <Route element={<ProjectDashboardLayout />}>
                    {projectRoutes.map((r) => (
                      <Route key={r.path} {...r} />
                    ))}
                  </Route> */}
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
