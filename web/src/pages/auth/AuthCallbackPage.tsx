import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useStore } from "@/store";
import { FullLine } from "@/components/Line";
import PlusDecor from "@/components/PlusDecor";

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
      navigate("/projects", { replace: true });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");
    const authToken = params.get("token");

    if (authToken && authToken.trim()) {
      setAuth(authToken.trim(), serverUrl);
      setStatus("success");
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/projects", { replace: true });
      return;
    }

    const reason = authParam && authParam !== "null" ? authParam : "unknown";
    setStatus("error");
    setError(`Authentication failed (${reason}): Session token not found`);
  }, [isAuthenticated, navigate, serverUrl, setAuth]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,var(--accent-soft),transparent_55%),radial-gradient(circle_at_80%_100%,var(--accent-soft),transparent_50%)] opacity-30 dark:opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[80px_80px]" />
      </div>

      <div className="relative w-full max-w-md bg-background/95 backdrop-blur-[2px] dark:bg-background/80 z-50">
        <FullLine direction="vertical" />
        <PlusDecor position="top" />
        <FullLine />

        <div className="px-6 py-10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Authentication
          </p>

          <h2 className="mt-2 text-xl font-medium tracking-tight">
            Finishing login
          </h2>

          <div className="mt-6 z-10">
            {status === "loading" && (
              <div className="flex items-start gap-3 px-4 py-4">
                <Spinner className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Verifying session</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Completing OAuth handshake...
                  </p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="flex items-start gap-3 px-4 py-4 text-primary">
                <CheckCircle2 className="mt-0.5 size-4" />
                <p className="text-sm">
                  Authentication successful — redirecting
                </p>
              </div>
            )}

            {status === "error" && (
              <>
                <div className="flex items-start gap-2 py-4 text-destructive z-999">
                  <AlertTriangle className="mt-0.5 size-4" />
                  <p className="text-sm">{error}</p>
                </div>

                <div className="flex gap-2">
                  <Link to="/">
                    <Button
                      variant="outline"
                      className="h-11 rounded-md border-border/60 bg-background px-3.5 text-sm font-medium transition hover:bg-muted/30 dark:bg-muted/20 dark:hover:bg-muted/35"
                    >
                      Home
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button
                      variant="outline"
                      className="h-11 rounded-md border-border/60 bg-background px-3.5 text-sm font-medium transition hover:bg-muted/30 dark:bg-muted/20 dark:hover:bg-muted/35"
                    >
                      Retry
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <FullLine />
        <PlusDecor position="bottom" />
      </div>
    </div>
  );
}
