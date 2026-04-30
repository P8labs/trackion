import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@trackion/ui/button";
import { Topbar } from "../layouts/topbar";

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
        <div className="min-h-screen bg-background px-6 py-10 text-foreground">
          <Topbar />
          <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center justify-center">
            <div className="w-full rounded-2xl border border-destructive/20 bg-linear-to-b from-destructive/8 to-background p-6 shadow-sm">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The app hit an unexpected error. Reload to try again.
              </p>

              {this.state.error?.message && (
                <div className="mt-4 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  {this.state.error.message}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = "/projects";
                  }}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
