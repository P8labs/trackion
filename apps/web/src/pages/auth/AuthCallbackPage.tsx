import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalStore } from "@/store";
import { Button, Code, Text } from "@mantine/core";
import { Loader } from "@mantine/core";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const authToken = useGlobalStore((state) => state.authToken);
  const setAuthToken = useGlobalStore((state) => state.actions.setAuthToken);

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
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");
    const token = params.get("token");
    const errorParam = params.get("error");

    const resolveCallback = async () => {
      if (errorParam) {
        setStatus("error");
        setError(errorParam);
        return;
      }

      const effectiveToken = token?.trim() || authToken;

      if (!effectiveToken) {
        const reason =
          authParam && authParam !== "null" ? authParam : "unknown";
        setStatus("error");
        setError(`callback failed (${reason}): Session token not found`);
        return;
      }

      if (token && token.trim()) {
        setAuthToken(token.trim());
      }

      try {
        const user = await useGlobalStore.getState().api().getCurrentUser();
        const isVerified = Boolean(
          user.providers?.some((provider) => provider.verified),
        );

        if (isVerified) {
          setStatus("success");
          navigate("/projects", { replace: true });
          return;
        }

        setStatus("success");
        navigate("/auth/email/verify", { replace: true });
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "callback failed: unable to fetch the current user, token might be invalid",
        );
      }
    };

    void resolveCallback();
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
