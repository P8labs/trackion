import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createTheme, MantineProvider } from "@mantine/core";
import Providers from "./providers/index.tsx";
import { ErrorBoundary } from "./components/core/error-boundary.tsx";

const theme = createTheme({});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider
      theme={theme}
      forceColorScheme="dark"
      defaultColorScheme="dark"
    >
      <ErrorBoundary>
        <Providers>
          <App />
        </Providers>
      </ErrorBoundary>
    </MantineProvider>
  </StrictMode>,
);
