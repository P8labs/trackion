import { userHooks } from "@/hooks/queries/use-user";
import { AuthCard } from "./AuthCard";
import { Button, Group, PinInput, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { hasLength, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useGlobalStore } from "@/store";

export function AuthEmailVerifyPage() {
  const { mutateAsync, isPending } = userHooks.useVerifyEmail();
  const { mutateAsync: resendCodeAsync, isPending: isResending } =
    userHooks.useRequestEmailVerification();
  const navigate = useNavigate();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      code: "",
    },
    validate: {
      code: hasLength({ min: 6, max: 6 }, "Code must be 6 characters"),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    if (form.validate().hasErrors) {
      return;
    }

    try {
      await mutateAsync(values.code, {
        onError(error) {
          notifications.show({
            title: "Email verification failed",
            color: "red",
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred during email verification.",
          });
        },
        async onSuccess() {
          await useGlobalStore.getState().actions.fetchCurrentUser(true);
          navigate("/projects", { replace: true });
        },
      });
    } catch (error) {
      console.error("Error verifying email:", error);
    }
  }

  async function handleResend() {
    try {
      await resendCodeAsync(undefined, {
        onError(error) {
          notifications.show({
            title: "Resend code failed",
            color: "red",
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred while resending the code.",
          });
        },
        onSuccess() {
          notifications.show({
            title: "Code resent",
            message: "A new verification code has been sent to your inbox.",
          });
        },
      });
    } catch (error) {
      console.error("Error resending code:", error);
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      description="Enter the 6 character alphanumeric code we sent to your inbox."
      className="w-full max-w-md space-y-6"
    >
      <form className="space-y-4" onSubmit={form.onSubmit(handleSubmit)}>
        <div className="space-y-2">
          <div className="flex justify-center">
            <PinInput
              {...form.getInputProps("code")}
              length={6}
              type="alphanumeric"
              size="lg"
              classNames={{
                input: "flex items-center justify-center text-center!",
                pinInput: "flex items-center justify-center text-center!",
              }}
              autoFocus
              disabled={isPending || isResending}
            />
          </div>
        </div>

        <Group grow>
          <Button
            fullWidth
            size="lg"
            type="button"
            variant="default"
            disabled={isPending || isResending}
            onClick={handleResend}
          >
            Resend code
          </Button>
          <Button
            fullWidth
            size="lg"
            type="submit"
            disabled={isPending || isResending}
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
