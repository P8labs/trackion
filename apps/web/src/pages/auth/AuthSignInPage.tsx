import { userHooks } from "@/hooks/queries/use-user";
import { AuthCard, AuthOAuthButtons } from "./AuthCard";
import { Button, PasswordInput, TextInput, Text } from "@mantine/core";
import { hasLength, isEmail, useForm } from "@mantine/form";
import { Link, useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";

export function AuthSignInPage() {
  const { mutateAsync, isPending } = userHooks.useLoginWithEmail();
  const navigate = useNavigate();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: isEmail("Please enter a valid email"),
      password: hasLength({ min: 8 }, "Password must be at least 8 characters"),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    if (form.validate().hasErrors) {
      return;
    }

    try {
      const token = await mutateAsync(values, {
        onError(error) {
          console.error("Login error:", error);
          notifications.show({
            title: "Login failed",
            color: "red",
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred during login.",
          });
        },
        onSuccess() {
          navigate("/auth/callback?token=" + token);
        },
      });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  }
  return (
    <AuthCard
      title="Sign in to Trackion"
      description="Use your email and password, or continue with an OAuth provider."
      className="w-full max-w-md space-y-5"
    >
      <form className="space-y-4" onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          {...form.getInputProps("email")}
          label="Your Email"
          placeholder="you@company.com"
          type="email"
          autoComplete="email"
          disabled={isPending}
        />
        <PasswordInput
          {...form.getInputProps("password")}
          label="Your Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={isPending}
        />
        <div className="flex items-center justify-end gap-3 text-sm -mt-3">
          <Link
            to="/auth/email/recovery"
            className="text-sm text-(--mantine-color-cyan-text) hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button fullWidth size="lg" type="submit" loading={isPending}>
          Sign in
        </Button>
      </form>

      <div className="flex items-center gap-1 text-sm -mt-2">
        <Text component="span" c="dimmed">
          Need an account?
        </Text>
        <Link
          to="/auth/signup"
          className="text-(--mantine-color-cyan-text) cursor-pointer hover:underline"
        >
          Create one
        </Link>
      </div>

      <div className="space-y-3">
        <Text className="mb-2!" component="p" size="sm" c="dimmed" ta="center">
          Or continue with
        </Text>
        <AuthOAuthButtons layout="row" />
      </div>
    </AuthCard>
  );
}
