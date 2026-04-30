import { createApi } from "../api";

export const userQueryKeys = {
  user: ["current-user"] as const,
  usage: ["usage"] as const,
  logout: ["logout"] as const,
  planInfo: ["plan-info"] as const,
  serverHealth: (serverUrl: string) => ["server-health", serverUrl] as const,
  loginWithToken: (token: string) => ["login-with-token", token] as const,
};

export function createUserQueries(api: ReturnType<typeof createApi>) {
  return {
    serverHealth: (serverUrl: string) => ({
      queryKey: userQueryKeys.serverHealth(serverUrl),
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
    loginWithToken: () => ({
      mutationFn: (token: string) => api.loginWithToken(token),
    }),

    logout: () => ({
      mutationFn: () => api.logout(),
    }),
  };
}
