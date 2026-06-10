import { AuthCard, AuthOAuthButtons } from "./AuthCard";
import { Button, PasswordInput, TextInput, Text } from "@mantine/core";
import { Link } from "react-router-dom";

export function AuthSignInPage() {
  return (
    <AuthCard
      title="Sign in to Trackion"
      description="Use your email and password, or continue with an OAuth provider."
      className="w-full max-w-md space-y-5"
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <TextInput
          label="Email"
          placeholder="you@company.com"
          type="email"
          required
          autoComplete="email"
        />
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          minLength={8}
        />
        <div className="flex items-center justify-end gap-3 text-sm -mt-3">
          <Link
            to="/auth/email/recovery"
            className="text-sm text-(--mantine-color-cyan-text) hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button fullWidth size="lg" type="submit">
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
