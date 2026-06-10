import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalStore } from "@/store";
import { Button, Code, Text } from "@mantine/core";
import { Loader } from "@mantine/core";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { authToken } = useGlobalStore();

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

    if (authToken) {
      setStatus("success");
      navigate("/projects", { replace: true });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");
    const token = params.get("token");
    const errorParam = params.get("error");

    if (errorParam) {
      setStatus("error");
      setError(errorParam);
      return;
    }

    if (token && token.trim()) {
      useGlobalStore.getState().actions.setAuthToken(token.trim());
      setStatus("success");
      navigate("/projects", { replace: true });
      return;
    }

    const reason = authParam && authParam !== "null" ? authParam : "unknown";
    setStatus("error");
    setError(`callback failed (${reason}): Session token not found`);
  }, [navigate]);

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
