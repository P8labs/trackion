import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { useGlobal } from "@/providers/global-provider";
import { Button, Code, Text } from "@mantine/core";
import { Loader } from "@mantine/core";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated, serverUrl, setAuth } = useStore();
  const { login } = useGlobal();

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
    const errorParam = params.get("error");

    if (errorParam) {
      setStatus("error");
      setError(errorParam);
      return;
    }

    if (authToken && authToken.trim()) {
      setAuth(authToken.trim(), serverUrl);
      login(authToken.trim());
      setStatus("success");
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/projects", { replace: true });
      return;
    }

    const reason = authParam && authParam !== "null" ? authParam : "unknown";
    setStatus("error");
    setError(`callback failed (${reason}): Session token not found`);
  }, [isAuthenticated, navigate, serverUrl, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden w-full">
      <div className="mx-auto w-full max-w-sm">
        {status === "error" ? (
          <div className="flex items-start justify-center flex-col gap-2 p-4">
            <Text size="md">Failed to process callback request.</Text>
            <Text size="sm" color="red">
              Error Message: <Code>{error}</Code>
            </Text>
            <Link
              to="/auth"
              className="flex items-center justify-center py-2 w-full"
            >
              <Button variant="default" fullWidth>
                Retry
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-center flex-col space-y-4">
            <Loader color="blue" type="bars" size="lg" />
            <Text className="ml-4 text-sm text-muted-foreground">
              Processing callback, please wait...
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
