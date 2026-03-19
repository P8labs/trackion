import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated, serverUrl, setAuth } = useStore();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");
    const authToken = params.get("token");

    if (!isAuthenticated) {
      if (authToken) {
        setAuth(authToken, serverUrl);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        navigate("/dashboard");
      } else {
        // Use setTimeout to defer setState to avoid synchronous setState in effect
        setTimeout(() => {
          setError(
            `Authentication failed (${authParam}): Session token not found`,
          );
        }, 0);
      }
    }
  }, [isAuthenticated, navigate, serverUrl, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      {error && (
        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
