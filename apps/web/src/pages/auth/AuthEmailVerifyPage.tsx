import { AuthCard } from "./AuthCard";
import { Button, Group, PinInput, Text } from "@mantine/core";
import { useState } from "react";

export function AuthEmailVerifyPage() {
  const [code, setCode] = useState("");

  return (
    <AuthCard
      title="Verify your email"
      description="Enter the 6 character alphanumeric code we sent to your inbox."
      className="w-full max-w-md space-y-6"
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <div className="flex justify-center">
            <PinInput
              length={6}
              type="alphanumeric"
              value={code}
              onChange={setCode}
              size="lg"
              classNames={{
                input: "flex items-center justify-center text-center!",
                pinInput: "flex items-center justify-center text-center!",
              }}
              autoFocus
            />
          </div>
        </div>

        <Group grow>
          <Button fullWidth size="lg" type="button" variant="default">
            Resend code
          </Button>
          <Button
            fullWidth
            size="lg"
            type="submit"
            disabled={code.length !== 6}
          >
            Verify email
          </Button>
        </Group>
      </form>

      <Text component="p" size="sm" c="dimmed" ta="center">
        Code will expire in 15 minutes.
      </Text>
    </AuthCard>
  );
}
