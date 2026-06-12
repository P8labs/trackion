import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createApi, createApiClient } from "@/lib/api";
import { flags, SERVER_URL } from "@/lib/flags";
import type { User } from "@/types";

const USER_STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

type GlobalState = {
  user: User | null;
  userUpdatedAt: number | null;

  serverURL: string;
  authToken: string | null;

  actions: {
    getApi: () => ReturnType<typeof createApi>;
    fetchCurrentUser: (forceUpdate?: boolean) => Promise<User | null>;
    setServerUrl: (serverUrl: string) => void;
    setAuthToken: (token: string) => void;
    reset: () => void;
  };
};

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      serverURL: SERVER_URL,
      authToken: null,
      user: null,
      userUpdatedAt: null,
      actions: {
        getApi: () => {
          const { serverURL, authToken } = get();
          const client = createApiClient({
            baseUrl: serverURL,
            getAuthToken: () => authToken,
          });
          return createApi(client);
        },
        fetchCurrentUser: async (forceUpdate = false) => {
          const { user, userUpdatedAt, actions } = get();

          // Check if we have a user and if the cache is still fresh
          const isStale =
            !userUpdatedAt || Date.now() - userUpdatedAt > USER_STALE_TIME_MS;

          if (user && !isStale && !forceUpdate) {
            return user;
          }

          try {
            const api = actions.getApi();
            const fetchedUser = await api.getCurrentUser();

            set({
              user: fetchedUser,
              userUpdatedAt: Date.now(),
            });

            return fetchedUser;
          } catch (error) {
            console.error("Failed to fetch user:", error);
            return null;
          }
        },
        reset: () => set({ authToken: null, user: null, userUpdatedAt: null }),
        setServerUrl: (url) => set({ serverURL: url }),
        setAuthToken: (token) => set({ authToken: token }),
      },
    }),
    {
      name: "trackion.global-state",
      version: 1,
      partialize: (state) => ({
        user: state.user,
        userUpdatedAt: state.userUpdatedAt,
        serverURL: state.serverURL,
        authToken: state.authToken,
      }),
    },
  ),
);

export const oauthLogin = (provider: "google" | "github") => {
  const { serverURL } = useGlobalStore.getState();
  const baseUrl = serverURL.replace(/\/+$/, "");
  const loginUrl = `${baseUrl}/auth/login/${provider}?client=${flags.device}`;
  return loginUrl;
};
