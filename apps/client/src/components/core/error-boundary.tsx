import { Component, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Button, Code, Paper } from "@mantine/core";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center select-text">
          <Paper>
            <h2 className="text-xl font-semibold tracking-tight">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The app hit an unexpected error. Reload to try again.
            </p>

            {this.state.error?.message && (
              <Code className="mt-4 px-3 py-2 text-xs">
                {this.state.error.message}
              </Code>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                onClick={() => window.location.reload()}
                leftSection={<RotateCcw className="h-4 w-4" />}
              >
                Reload Page
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  window.location.href = "/projects";
                }}
              >
                Back to Dashboard
              </Button>
            </div>
          </Paper>
        </div>
      );
    }

    return this.props.children;
  }
}
