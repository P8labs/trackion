import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginWithToken } from "@/lib/api";
import { SERVER_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
  LockIcon,
  ServerIcon,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";

const authSchema = z.object({
  serverUrl: z.url("Enter a valid server URL."),
  adminToken: z.string().min(1, "Admin token is required."),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function SelfhostForm() {
  const navigate = useNavigate();
  const { setAuth } = useStore();
  const [showSelfHostInputs, setShowSelfHostInputs] = useState(false);

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

  const handleTokenLogin = (values: AuthFormValues) => {
    loginMutation.mutate({
      serverUrl: values.serverUrl.trim(),
      adminToken: values.adminToken.trim(),
    });
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setShowSelfHostInputs((prev) => !prev)}
        aria-expanded={showSelfHostInputs}
        className="flex w-full cursor-pointer items-start justify-between rounded-md border border-border/60 bg-background px-3 py-2.5 text-left transition-colors hover:bg-muted/20 dark:bg-muted/15 dark:hover:bg-muted/30"
      >
        <div className="pr-4">
          <p className="text-sm font-medium text-foreground">
            Use self-host credentials
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {showSelfHostInputs
              ? "Hide manual server URL and admin token fields"
              : "Expand to connect with your server and admin token"}
          </p>
        </div>
        {showSelfHostInputs ? (
          <ChevronUpIcon className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        )}
      </button>

      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          showSelfHostInputs
            ? "mt-4 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
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
                    <FieldLabel
                      htmlFor="server-url"
                      className="text-xs uppercase tracking-[0.08em] text-muted-foreground"
                    >
                      Server URL
                    </FieldLabel>
                    <div className="relative">
                      <ServerIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        {...field}
                        id="server-url"
                        aria-invalid={fieldState.invalid}
                        type="url"
                        className="h-10 rounded-md border-border/60 bg-background pl-10 focus-visible:border-primary focus-visible:ring-0 dark:bg-muted/10"
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
                    <FieldLabel
                      htmlFor="admin-token"
                      className="text-xs uppercase tracking-[0.08em] text-muted-foreground"
                    >
                      Admin Token
                    </FieldLabel>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        {...field}
                        id="admin-token"
                        aria-invalid={fieldState.invalid}
                        className="h-10 rounded-md border-border/60 bg-background pl-10 focus-visible:border-primary focus-visible:ring-0 dark:bg-muted/10"
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
              <div className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive">
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
              variant="outline"
              className="h-10 w-full cursor-pointer justify-center rounded-md border-border/60 bg-background text-sm font-medium hover:bg-muted/20 dark:bg-muted/20 dark:hover:bg-muted/35"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login with admin token"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
