import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Sparkles,
  Server,
  Lock,
  Loader2,
  ShieldCheck,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store";
import { loginWithToken, getGithubLoginUrl } from "@/lib/api";
import { flags } from "@/lib/flags";
import { SERVER_URL } from "@/lib/constants";
import { Icons } from "@/lib/icons";

const authSchema = z.object({
  serverUrl: z.url("Enter a valid server URL."),
  adminToken: z.string().min(1, "Admin token is required."),
});

type AuthFormValues = z.infer<typeof authSchema>;

export function AuthPage() {
  const navigate = useNavigate();
  const { setAuth } = useStore();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      serverUrl: SERVER_URL,
      adminToken: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({
      serverUrl,
      adminToken,
    }: Pick<AuthFormValues, "serverUrl" | "adminToken">) => {
      const result = await loginWithToken(adminToken, serverUrl);
      return { result, serverUrl };
    },
    onSuccess: ({ result, serverUrl }) => {
      setAuth(result.token, serverUrl, result.user);
      navigate("/dashboard");
    },
  });

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const handleTokenLogin = (values: AuthFormValues) => {
    loginMutation.mutate({
      serverUrl: values.serverUrl.trim(),
      adminToken: values.adminToken.trim(),
    });
  };

  const handleGithubLogin = () => {
    const githubLoginUrl = getGithubLoginUrl(
      form.getValues("serverUrl").trim(),
    );
    window.location.href = githubLoginUrl;
  };

  return (
    <div className="flex items-center justify-center relative min-h-screen overflow-hidden bg-background px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-chart-2/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-5xl gap-6  min-[850px]:grid-cols-[1.15fr_1fr] min-[850px]:items-center">
        <div className="hidden min-[850px]:block rounded-2xl border border-border/70 bg-card/70 p-8 backdrop-blur-sm">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/80 bg-accent/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="size-3.5" />
            {greeting}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Welcome back to Trackion
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
            Your analytics command center is ready. Sign in to monitor events,
            compare trends, and ship product decisions with confidence.
          </p>

          <div className="mt-7 grid gap-3 text-sm">
            <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-accent/65 px-4 py-3">
              <LineChart className="size-4 text-primary" />
              <p>Real-time event intelligence across your projects</p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-accent/65 px-4 py-3">
              <ShieldCheck className="size-4 text-primary" />
              <p>Secure workspace sessions with explicit consent controls</p>
            </div>
          </div>
        </div>

        <Card className="border-border/80 bg-card/85 shadow backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Continue to Dashboard
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Connect to your server and unlock your dashboard.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              onSubmit={form.handleSubmit(handleTokenLogin)}
              className="space-y-4"
              id="login-form"
            >
              <FieldGroup>
                <Controller
                  name="serverUrl"
                  disabled={loginMutation.isPending}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="server-url">Server URL</FieldLabel>
                      <div className="relative">
                        <Server className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          id="server-url"
                          aria-invalid={fieldState.invalid}
                          type="url"
                          className="pl-10"
                          placeholder="http://localhost:8000"
                        />
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="adminToken"
                  control={form.control}
                  disabled={loginMutation.isPending}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="admin-token">Admin Token</FieldLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          id="admin-token"
                          aria-invalid={fieldState.invalid}
                          className="pl-10"
                          placeholder="Enter your admin token"
                        />
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              {loginMutation.isError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                  <p className="text-sm">
                    {loginMutation.error instanceof Error
                      ? loginMutation.error.message
                      : "Login failed"}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            {flags.enableGithubLogin && (
              <div>
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="px-2 text-muted-foreground bg-accent">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleGithubLogin}
                  variant="outline"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  <Icons.github />
                  Continue With GitHub
                </Button>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-center text-xs text-muted-foreground">
                By logging in, you agree to our{" "}
                <Link
                  to="/terms"
                  className="text-primary underline underline-offset-4"
                >
                  Terms
                </Link>
                <span> and </span>
                <Link
                  to="/privacy"
                  className="text-primary underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
                .
              </p>
              <p className="text-center text-xs text-muted-foreground">
                Need help signing in? Check your token in server settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
