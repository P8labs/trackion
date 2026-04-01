import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TrackionProvider } from "@trackion/web/react";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function ErrorFallback() {
  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        background: "#fee2e2",
        border: "1px solid #fecaca",
        borderRadius: "0.5rem",
        margin: "2rem",
      }}
    >
      <h2 style={{ color: "#dc2626" }}>Something went wrong</h2>
      <p>We've automatically reported this error.</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "0.25rem",
          cursor: "pointer",
        }}
      >
        Reload Page
      </button>
    </div>
  );
}

const trackionConfig = {
  serverUrl: "http://localhost:8000", // Update this to your Trackion server
  apiKey: "fe05b2f6-5532-5353-bf0a-dd6f9861680b", // Update this to your API key
  userId: "demo_user",
  autoPageview: true,
  batchSize: 10,
  flushIntervalMs: 3000,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <TrackionProvider options={trackionConfig}>
          <App />
        </TrackionProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
