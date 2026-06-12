import { AuthCard, AuthOAuthButtons } from "./AuthCard";
import { Button, PasswordInput, TextInput, Text } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { hasLength, isEmail, useForm } from "@mantine/form";
import { userHooks } from "@/hooks/queries/use-user";
import { notifications } from "@mantine/notifications";

export function AuthSignUpPage() {
  const { mutateAsync, isPending } = userHooks.useSignUpWithEmail();
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
      const { token } = await mutateAsync(values, {
        onError(error) {
          notifications.show({
            title: "Login failed",
            color: "red",
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred during login.",
          });
        },
      });
      navigate("/auth/callback?token=" + token);
    } catch (error) {
      console.error("Error signing up:", error);
    }
  }

  return (
    <AuthCard
      title="Create your Trackion account"
      description="Start with your email and password, or choose an OAuth provider."
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
          placeholder="Create a password"
          autoComplete="new-password"
          disabled={isPending}
        />
        <Button fullWidth size="lg" type="submit" loading={isPending}>
          Create account
        </Button>
      </form>

      <div className="flex items-center gap-1 text-sm">
        <Text component="span" c="dimmed">
          Already have an account?
        </Text>
        <Link
          to="/auth/signin"
          className="text-(--mantine-color-cyan-text) cursor-pointer hover:underline"
        >
          Sign in
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
