import { AuthCard, AuthOAuthButtons } from "./AuthCard";
import { Button, PasswordInput, TextInput, Text } from "@mantine/core";
import { Link } from "react-router-dom";

export function AuthSignUpPage() {
  return (
    <AuthCard
      title="Create your Trackion account"
      description="Start with your email and password, or choose an OAuth provider."
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
          placeholder="Create a password"
          required
          autoComplete="new-password"
        />
        <Button fullWidth size="lg" type="submit">
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
