import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Server,
  Lock,
  Loader2,
  ShieldCheck,
  LineChart,
  Cloud,
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
import {
  loginWithToken,
  getGithubLoginUrl,
  getGoogleLoginUrl,
} from "@/lib/api";
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
  const [showSelfHostInputs, setShowSelfHostInputs] = useState(false);

  const showGithubButton = flags.isSaaS && flags.enableGithubLogin;
  const showGoogleButton = flags.isSaaS && flags.enableGoogleLogin;
  const showOAuthSection = showGithubButton || showGoogleButton;

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

  const handleGoogleLogin = () => {
    const googleLoginUrl = getGoogleLoginUrl(
      form.getValues("serverUrl").trim(),
    );
    window.location.href = googleLoginUrl;
  };

  return (
    <div className="flex items-center justify-center relative min-h-screen overflow-hidden bg-background px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-chart-2/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-6 min-[900px]:grid-cols-[1.2fr_1fr] min-[900px]:items-center">
        <div className="hidden min-[850px]:block rounded-2xl border border-border/70 bg-card/70 p-8 backdrop-blur-sm">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/80 bg-accent/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="size-3.5" />
            {greeting}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Continue where your insights left off
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
            Trackion keeps your telemetry crisp and actionable. Sign in to
            inspect sessions, monitor event flow, and validate launches faster.
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
            <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-accent/65 px-4 py-3">
              <Cloud className="size-4 text-primary" />
              <p>Cloud OAuth and self-host token access in one place</p>
            </div>
          </div>
        </div>

        <Card className="border-border/80 bg-card/85 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Continue to Dashboard
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Use SaaS OAuth or expand self-host token login.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {showOAuthSection && (
              <div className="space-y-3">
                {showGoogleButton && (
                  <Button
                    onClick={handleGoogleLogin}
                    variant="default"
                    className="w-full cursor-pointer py-6 text-base"
                    disabled={loginMutation.isPending}
                    type="button"
                  >
                    <Icons.google className="size-4" />
                    Continue With Google
                  </Button>
                )}

                {showGithubButton && (
                  <Button
                    onClick={handleGithubLogin}
                    variant="outline"
                    className="w-full cursor-pointer py-6 text-base"
                    disabled={loginMutation.isPending}
                    type="button"
                  >
                    <Icons.github />
                    Continue With GitHub
                  </Button>
                )}
              </div>
            )}

            {showOAuthSection && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Self-host token login
                  </span>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border/80 bg-accent/40 p-4">
              <button
                type="button"
                onClick={() => setShowSelfHostInputs((prev) => !prev)}
                className="flex w-full cursor-pointer items-center justify-between text-left"
              >
                <div>
                  <p className="text-sm font-semibold">Self-hosted login</p>
                  <p className="text-xs text-muted-foreground">
                    {showSelfHostInputs
                      ? "Hide manual server and admin token fields"
                      : "Expand to connect with server URL and admin token"}
                  </p>
                </div>
                {showSelfHostInputs ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </button>

              {showSelfHostInputs && (
                <form
                  onSubmit={form.handleSubmit(handleTokenLogin)}
                  className="mt-4 space-y-4"
                  id="login-form"
                >
                  <FieldGroup>
                    <Controller
                      name="serverUrl"
                      disabled={loginMutation.isPending}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="server-url">
                            Server URL
                          </FieldLabel>
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
                          <FieldLabel htmlFor="admin-token">
                            Admin Token
                          </FieldLabel>
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
                    className="w-full cursor-pointer"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login with Admin Token"
                    )}
                  </Button>
                </form>
              )}
            </div>

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
                Need help signing in? For self-host mode, use your admin token.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
