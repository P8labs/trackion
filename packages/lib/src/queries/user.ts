import { createApi } from "../api";

export const userQueryKeys = {
  user: ["current-user"] as const,
  usage: ["usage"] as const,
  logout: ["logout"] as const,
  planInfo: ["plan-info"] as const,
  serverHealth: () => ["server-health"] as const,
  loginWithToken: (token: string) => ["login-with-token", token] as const,
};

export function createUserQueries(api: ReturnType<typeof createApi>) {
  return {
    serverHealth: () => ({
      queryKey: userQueryKeys.serverHealth(),
      queryFn: api.getServerHealth,
      retry: 1,
      refetchInterval: 30000,
    }),
    user: () => ({
      queryKey: userQueryKeys.user,
      queryFn: api.getCurrentUser,
    }),

    usage: () => ({
      queryKey: userQueryKeys.usage,
      queryFn: api.getUsage,
      staleTime: 5 * 60 * 1000,
    }),

    logout: () => ({
      queryKey: userQueryKeys.logout,
      queryFn: api.logout,
    }),
  };
}

export function createUserMutations(api: ReturnType<typeof createApi>) {
  return {
    loginWithEmail: () => ({
      mutationFn: ({ email, password }: { email: string; password: string }) =>
        api.loginWithEmail(email, password),
    }),
    signupWithEmail: () => ({
      mutationFn: ({ email, password }: { email: string; password: string }) =>
        api.signupWithEmail(email, password),
    }),

    verifyEmail: () => ({
      mutationFn: (code: string) => api.verifyEmail(code),
    }),

    requestEmailVerification: () => ({
      mutationFn: () => api.requestEmailVerification(),
    }),

    requestPasswordReset: () => ({
      mutationFn: (email: string) => api.requestPasswordReset(email),
    }),

    resetPassword: () => ({
      mutationFn: ({
        token,
        newPassword,
      }: {
        token: string;
        newPassword: string;
      }) => api.resetPassword(token, newPassword),
    }),

    setupDefaultSubscription: () => ({
      mutationFn: () => api.setupDefaultSubscription(),
    }),

    logout: () => ({
      mutationFn: () => api.logout(),
    }),
  };
}
