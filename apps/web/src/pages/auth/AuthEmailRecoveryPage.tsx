import { AuthCard } from "./AuthCard";
import {
  Button,
  Group,
  PasswordInput,
  PinInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useState } from "react";

type RecoveryStep = "email" | "reset";

export function AuthEmailRecoveryPage() {
  const [step, setStep] = useState<RecoveryStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const title =
    step === "email" ? "Recover your password" : "Reset your password";
  const description =
    step === "email"
      ? "Send a recovery email first, then confirm the code and choose a new password."
      : "Enter the verification code from your inbox, then choose a new password.";

  return (
    <AuthCard
      title={title}
      description={description}
      className="w-full max-w-md space-y-6"
    >
      {step === "email" ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim()) return;
            setStep("reset");
          }}
        >
          <TextInput
            label="Email"
            placeholder="you@company.com"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
          />
          <Button fullWidth size="lg" type="submit">
            Send recovery email
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex justify-center">
            <PinInput
              length={6}
              type="alphanumeric"
              size="lg"
              value={code}
              onChange={setCode}
              autoFocus
              classNames={{
                input: "flex items-center justify-center text-center!",
                pinInput: "flex items-center justify-center text-center!",
              }}
            />
          </div>

          <PasswordInput
            label="New password"
            placeholder="Create a new password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.currentTarget.value)}
          />

          <Group grow>
            <Button
              fullWidth
              size="lg"
              type="button"
              variant="default"
              onClick={() => setStep("email")}
            >
              Change email
            </Button>
            <Button
              fullWidth
              size="lg"
              type="submit"
              disabled={code.length !== 6 || !newPassword.trim()}
            >
              Reset password
            </Button>
          </Group>
        </form>
      )}

      <Text component="p" size="sm" c="dimmed" ta="center">
        Make sure to use the same email address that received the recovery
        message.
      </Text>
    </AuthCard>
  );
}
