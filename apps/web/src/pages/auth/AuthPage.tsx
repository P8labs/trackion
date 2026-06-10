import { AuthCard, AuthOAuthButtons } from "./AuthCard";

export function AuthPage() {
  return (
    <AuthCard
      title="Continue to Dashboard"
      description="Choose a provider or expand self-host credentials in the same system flow."
      className="space-y-4"
    >
      <AuthOAuthButtons layout="stack" />
    </AuthCard>
  );
}
