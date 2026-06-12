import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { authRoutes } from "@/routes";
import { renderWithProviders } from "@/test/render";
import { AuthSignInPage } from "./AuthSignInPage";
import { AuthSignUpPage } from "./AuthSignUpPage";
import { AuthEmailVerifyPage } from "./AuthEmailVerifyPage";
import { AuthEmailRecoveryPage } from "./AuthEmailRecoveryPage";
import { AuthCallbackPage } from "./AuthCallbackPage";

const mockNavigate = vi.fn();
const mockSetAuthToken = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockSetServerUrl = vi.fn();
const mockNotificationsShow = vi.fn();

const mockLoginMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockSignupMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockVerifyEmailMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockRequestVerificationMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockRequestResetMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockResetPasswordMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockStoreState = {
  serverURL: "http://localhost:8000",
  authToken: null as string | null,
  api: () => ({
    getCurrentUser: mockGetCurrentUser,
  }),
  actions: {
    setAuthToken: (token: string) => {
      mockSetAuthToken(token);
      mockStoreState.authToken = token;
    },
    setServerUrl: mockSetServerUrl,
  },
};

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/store", () => ({
  useGlobalStore: Object.assign(
    (selector?: (state: typeof mockStoreState) => unknown) =>
      selector ? selector(mockStoreState) : mockStoreState,
    {
      getState: () => mockStoreState,
    },
  ),
  oauthLogin: () => "http://localhost:8000/auth/login/google?client=web",
}));

vi.mock("@/hooks/queries/use-user", () => ({
  userHooks: {
    useLoginWithEmail: () => mockLoginMutation,
    useSignUpWithEmail: () => mockSignupMutation,
    useVerifyEmail: () => mockVerifyEmailMutation,
    useRequestEmailVerification: () => mockRequestVerificationMutation,
    useRequestPasswordReset: () => mockRequestResetMutation,
    useResetPassword: () => mockResetPasswordMutation,
  },
}));

vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: mockNotificationsShow,
  },
}));

function renderAuthRoute(ui: React.ReactElement, route: string) {
  return renderWithProviders(ui, { route });
}

beforeEach(() => {
  mockNavigate.mockReset();
  mockSetAuthToken.mockClear();
  mockGetCurrentUser.mockReset();
  mockSetServerUrl.mockReset();
  mockNotificationsShow.mockReset();

  mockStoreState.authToken = null;
  mockStoreState.serverURL = "http://localhost:8000";

  mockLoginMutation.mutateAsync.mockReset();
  mockSignupMutation.mutateAsync.mockReset();
  mockVerifyEmailMutation.mutateAsync.mockReset();
  mockRequestVerificationMutation.mutateAsync.mockReset();
  mockRequestResetMutation.mutateAsync.mockReset();
  mockResetPasswordMutation.mutateAsync.mockReset();

  window.history.pushState({}, "", "/auth");
});

describe("Auth routes", () => {
  it("keeps the frontend auth route table complete and linear", () => {
    expect(authRoutes.map((route) => route.path)).toEqual([
      "/auth",
      "/auth/signin",
      "/auth/signup",
      "/auth/email/verify",
      "/auth/email/recovery",
      "/auth/callback",
    ]);
  });

  it("renders the sign in page and submits email login", async () => {
    const user = userEvent.setup();
    mockLoginMutation.mutateAsync.mockResolvedValueOnce("signin-token");

    renderAuthRoute(<AuthSignInPage />, "/auth/signin");

    expect(
      screen.getByRole("heading", { name: /sign in to trackion/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /forgot password\?/i }),
    ).toHaveAttribute("href", "/auth/email/recovery");
    expect(screen.getByRole("link", { name: /create one/i })).toHaveAttribute(
      "href",
      "/auth/signup",
    );

    await user.type(screen.getByLabelText(/your email/i), "user@example.com");
    await user.type(screen.getByLabelText(/your password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLoginMutation.mutateAsync).toHaveBeenCalledTimes(1);
    });
    expect(mockLoginMutation.mutateAsync).toHaveBeenCalledWith(
      { email: "user@example.com", password: "password123" },
      expect.any(Object),
    );
  });

  it("does not submit sign in with invalid fields", async () => {
    const user = userEvent.setup();

    renderAuthRoute(<AuthSignInPage />, "/auth/signin");

    await user.type(screen.getByLabelText(/your email/i), "not-an-email");
    await user.type(screen.getByLabelText(/your password/i), "short");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/please enter a valid email/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
    expect(mockLoginMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it("shows the sign in notification on failed email login", async () => {
    const user = userEvent.setup();
    mockLoginMutation.mutateAsync.mockImplementation(async (_, opts) => {
      opts?.onError?.(new Error("invalid credentials"));
      throw new Error("invalid credentials");
    });

    renderAuthRoute(<AuthSignInPage />, "/auth/signin");

    await user.type(screen.getByLabelText(/your email/i), "user@example.com");
    await user.type(screen.getByLabelText(/your password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNotificationsShow).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Login failed",
          color: "red",
          message: "invalid credentials",
        }),
      );
    });
  });

  it("renders the sign up page and submits email signup", async () => {
    const user = userEvent.setup();
    mockSignupMutation.mutateAsync.mockResolvedValueOnce("signup-token");

    renderAuthRoute(<AuthSignUpPage />, "/auth/signup");

    expect(
      screen.getByRole("heading", { name: /create your trackion account/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/auth/signin",
    );

    await user.type(screen.getByLabelText(/your email/i), "new@example.com");
    await user.type(screen.getByLabelText(/your password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignupMutation.mutateAsync).toHaveBeenCalledTimes(1);
    });
    expect(mockSignupMutation.mutateAsync).toHaveBeenCalledWith(
      { email: "new@example.com", password: "password123" },
      expect.any(Object),
    );
  });

  it("does not submit sign up with invalid fields", async () => {
    const user = userEvent.setup();

    renderAuthRoute(<AuthSignUpPage />, "/auth/signup");

    await user.type(screen.getByLabelText(/your email/i), "not-an-email");
    await user.type(screen.getByLabelText(/your password/i), "short");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/please enter a valid email/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
    expect(mockSignupMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it("renders the email verification page and resends the code", async () => {
    const user = userEvent.setup();
    mockRequestVerificationMutation.mutateAsync.mockResolvedValueOnce(
      undefined,
    );

    renderAuthRoute(<AuthEmailVerifyPage />, "/auth/email/verify");

    expect(
      screen.getByRole("heading", { name: /verify your email/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(6);

    await user.click(screen.getByRole("button", { name: /resend code/i }));

    await waitFor(() => {
      expect(mockRequestVerificationMutation.mutateAsync).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  it("submits the verification code and redirects to projects on success", async () => {
    const user = userEvent.setup();
    mockVerifyEmailMutation.mutateAsync.mockImplementation(async (_, opts) => {
      opts?.onSuccess?.();
      return undefined;
    });

    renderAuthRoute(<AuthEmailVerifyPage />, "/auth/email/verify");

    await user.type(screen.getAllByRole("textbox")[0], "ABC123");
    await user.click(screen.getByRole("button", { name: /verify email/i }));

    await waitFor(() => {
      expect(mockVerifyEmailMutation.mutateAsync).toHaveBeenCalledWith(
        "ABC123",
        expect.any(Object),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/projects", {
        replace: true,
      });
    });
  });

  it("does not submit an incomplete verification code", async () => {
    const user = userEvent.setup();

    renderAuthRoute(<AuthEmailVerifyPage />, "/auth/email/verify");

    await user.type(screen.getAllByRole("textbox")[0], "ABC");
    await user.click(screen.getByRole("button", { name: /verify email/i }));

    expect(
      await screen.findByText(/code must be 6 characters/i),
    ).toBeInTheDocument();
    expect(mockVerifyEmailMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it("renders the recovery page and advances to reset mode after sending email", async () => {
    const user = userEvent.setup();
    mockRequestResetMutation.mutateAsync.mockImplementation(async (_, opts) => {
      opts?.onSuccess?.();
      return undefined;
    });

    renderAuthRoute(<AuthEmailRecoveryPage />, "/auth/email/recovery");

    expect(
      screen.getByRole("heading", { name: /recover your password/i }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/email/i), "recover@example.com");
    await user.click(
      screen.getByRole("button", { name: /send recovery email/i }),
    );

    await waitFor(() => {
      expect(mockRequestResetMutation.mutateAsync).toHaveBeenCalledWith(
        "recover@example.com",
        expect.any(Object),
      );
    });

    expect(
      screen.getByRole("heading", { name: /reset your password/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i }),
    ).toBeInTheDocument();
  });

  it("renders recovery reset mode from hash and submits a reset", async () => {
    const user = userEvent.setup();
    mockResetPasswordMutation.mutateAsync.mockImplementation(async (_, opts) => {
      opts?.onSuccess?.();
      return undefined;
    });

    renderAuthRoute(<AuthEmailRecoveryPage />, "/auth/email/recovery#reset");

    expect(
      screen.getByRole("heading", { name: /reset your password/i }),
    ).toBeInTheDocument();

    await user.type(screen.getAllByRole("textbox")[0], "RST123");
    await user.type(screen.getByLabelText(/new password/i), "newpassword");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockResetPasswordMutation.mutateAsync).toHaveBeenCalledWith(
        { token: "RST123", newPassword: "newpassword" },
        expect.any(Object),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/auth/signin", {
        replace: true,
      });
    });
  });

  it("does not submit recovery forms with invalid values", async () => {
    const user = userEvent.setup();

    renderAuthRoute(<AuthEmailRecoveryPage />, "/auth/email/recovery");

    await user.type(screen.getByLabelText(/email/i), "bad-email");
    await user.click(
      screen.getByRole("button", { name: /send recovery email/i }),
    );

    expect(
      await screen.findByText(/please enter a valid email/i),
    ).toBeInTheDocument();
    expect(mockRequestResetMutation.mutateAsync).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /send recovery email/i }));
    expect(mockResetPasswordMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it("redirects the callback page to projects when the provider is verified", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({
      providers: [{ verified: true }],
    });

    renderAuthRoute(<AuthCallbackPage />, "/auth/callback?token=test-token");

    await waitFor(() => {
      expect(mockSetAuthToken).toHaveBeenCalledWith("test-token");
      expect(mockNavigate).toHaveBeenCalledWith("/projects", {
        replace: true,
      });
    });
  });

  it("redirects the callback page to email verification when the provider is not verified", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({
      providers: [{ verified: false }],
    });

    renderAuthRoute(<AuthCallbackPage />, "/auth/callback?token=test-token");

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth/email/verify", {
        replace: true,
      });
    });
  });

  it("uses the existing store token when callback URL has no token", async () => {
    mockStoreState.authToken = "stored-token";
    mockGetCurrentUser.mockResolvedValueOnce({
      providers: [{ verified: true }],
    });

    renderAuthRoute(<AuthCallbackPage />, "/auth/callback?auth=email");

    await waitFor(() => {
      expect(mockSetAuthToken).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/projects", {
        replace: true,
      });
    });
  });

  it("shows the callback error state when no token is available", async () => {
    renderAuthRoute(<AuthCallbackPage />, "/auth/callback?auth=email");

    expect(
      await screen.findByText(/failed to process callback request/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/callback failed \(email\): session token not found/i),
    ).toBeInTheDocument();
  });

  it("shows the callback error state when fetching the current user fails", async () => {
    mockGetCurrentUser.mockRejectedValueOnce(new Error("token expired"));

    renderAuthRoute(<AuthCallbackPage />, "/auth/callback?token=expired-token");

    expect(
      await screen.findByText(/failed to process callback request/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/token expired/i)).toBeInTheDocument();
  });

  it("shows the callback error state when the provider returns an error", async () => {
    renderAuthRoute(<AuthCallbackPage />, "/auth/callback?error=oauth_denied");

    expect(
      await screen.findByText(/failed to process callback request/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/oauth_denied/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /retry/i })).toHaveAttribute(
      "href",
      "/auth",
    );
  });
});
