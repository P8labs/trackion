import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useStore } from "@/store";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated, serverUrl, setAuth } = useStore();
  const hasHandledCallback = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasHandledCallback.current) {
      return;
    }

    hasHandledCallback.current = true;

    if (isAuthenticated) {
      setStatus("success");
      navigate("/dashboard", { replace: true });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");
    const authToken = params.get("token");

    if (authToken && authToken.trim()) {
      setAuth(authToken.trim(), serverUrl);
      setStatus("success");
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/dashboard", { replace: true });
      return;
    }

    const reason = authParam && authParam !== "null" ? authParam : "unknown";
    setStatus("error");
    setError(`Authentication failed (${reason}): Session token not found`);
  }, [isAuthenticated, navigate, serverUrl, setAuth]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-14 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 bottom-8 h-80 w-80 rounded-full bg-chart-2/20 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-border/80 bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Finishing logging in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-background/80 p-4">
              <Spinner className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Verifying your session</p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we complete your GitHub authentication.
                </p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4 text-primary">
              <CheckCircle2 className="mt-0.5 size-4" />
              <p className="text-sm">
                Authentication successful. Redirecting...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                <AlertTriangle className="mt-0.5 size-4" />
                <p className="text-sm">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/")}
                >
                  Back to home
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => navigate("/auth")}
                >
                  Try again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
