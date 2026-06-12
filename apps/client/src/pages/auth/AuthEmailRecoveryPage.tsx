import { userHooks } from "@/hooks/queries/use-user";
import { AuthCard } from "./AuthCard";
import {
  Button,
  Group,
  PasswordInput,
  PinInput,
  Text,
  TextInput,
} from "@mantine/core";
import { hasLength, isEmail, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { useHash } from "@mantine/hooks";

export function AuthEmailRecoveryPage() {
  const [step, setStep] = useHash({
    getInitialValueInEffect: false,
  });
  const navigate = useNavigate();

  const { mutateAsync: requestResetAsync, isPending: isRequestingReset } =
    userHooks.useRequestPasswordReset();
  const { mutateAsync: resetPasswordAsync, isPending: isResettingPassword } =
    userHooks.useResetPassword();

  const isPending = isRequestingReset || isResettingPassword;

  const emailForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
    },
    validate: {
      email: isEmail("Please enter a valid email"),
    },
  });

  const resetForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      code: "",
      newPassword: "",
    },
    validate: {
      code: hasLength({ min: 6, max: 6 }, "Code must be 6 characters"),
      newPassword: hasLength(
        { min: 8 },
        "Password must be at least 8 characters",
      ),
    },
  });

  async function handleRequestReset(values: typeof emailForm.values) {
    if (emailForm.validate().hasErrors) {
      return;
    }

    try {
      await requestResetAsync(values.email, {
        onError(error) {
          notifications.show({
            title: "Request failed",
            color: "red",
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred while requesting password reset.",
          });
        },
        onSuccess() {
          setStep("reset");
        },
      });
    } catch (error) {
      console.error("Error requesting password reset:", error);
    }
  }

  async function handleResetPassword(values: typeof resetForm.values) {
    if (resetForm.validate().hasErrors) {
      return;
    }

    try {
      await resetPasswordAsync(
        { token: values.code, newPassword: values.newPassword },
        {
          onError(error) {
            notifications.show({
              title: "Reset failed",
              color: "red",
              message:
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred while resetting the password.",
            });
          },
          onSuccess() {
            navigate("/auth/signin", { replace: true });
          },
        },
      );
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  }

  const title = IsEmailView(step)
    ? "Recover your password"
    : "Reset your password";
  const description = IsEmailView(step)
    ? "Send a recovery email first, then confirm the code and choose a new password."
    : "Enter the verification code from your inbox, then choose a new password.";

  return (
    <AuthCard
      title={title}
      description={description}
      className="w-full max-w-md space-y-6"
    >
      {IsEmailView(step) ? (
        <form
          className="space-y-4"
          onSubmit={emailForm.onSubmit(handleRequestReset)}
        >
          <TextInput
            {...emailForm.getInputProps("email")}
            label="Email"
            placeholder="you@company.com"
            type="email"
            autoComplete="email"
            disabled={isPending}
          />
          <Button fullWidth size="lg" type="submit" disabled={isPending}>
            Send recovery email
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={resetForm.onSubmit(handleResetPassword)}
        >
          <div className="flex justify-center">
            <PinInput
              {...resetForm.getInputProps("code")}
              length={6}
              type="alphanumeric"
              size="lg"
              autoFocus
              classNames={{
                input: "flex items-center justify-center text-center!",
                pinInput: "flex items-center justify-center text-center!",
              }}
              disabled={isPending}
            />
          </div>

          <PasswordInput
            {...resetForm.getInputProps("newPassword")}
            label="New password"
            placeholder="Create a new password"
            autoComplete="new-password"
            disabled={isPending}
          />

          <Group grow>
            <Button
              fullWidth
              size="lg"
              type="button"
              variant="default"
              onClick={() => setStep("email")}
              disabled={isPending}
            >
              Change email
            </Button>
            <Button fullWidth size="lg" type="submit" disabled={isPending}>
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

function IsEmailView(hash: string): boolean {
  if (!hash) return true;
  if (hash.length === 0) return true;
  return hash === "#email";
}
