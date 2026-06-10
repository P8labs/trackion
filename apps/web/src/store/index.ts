import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SERVER_URL } from "@/lib/constants";
import { createApi, createApiClient } from "@trackion/lib/api";
import { flags } from "@/lib/flags";

type GlobalState = {
  serverURL: string;
  authToken: string | null;
  api: () => ReturnType<typeof createApi>;

  actions: {
    reset: () => void;
    setServerUrl: (serverUrl: string) => void;
    setAuthToken: (token: string) => void;
  };
};

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      serverURL: SERVER_URL,
      authToken: null,
      api: () => {
        const client = createApiClient({
          baseUrl: useGlobalStore.getState().serverURL,
          getAuthToken: () => useGlobalStore.getState().authToken,
        });
        return createApi(client);
      },
      actions: {
        reset: () => set({ authToken: null }),
        setServerUrl: (url) => set({ serverURL: url }),
        setAuthToken: (token) => set({ authToken: token }),
      },
    }),
    { name: "trackion.global-state", version: 1 },
  ),
);

export const oauthLogin = (provider: "google" | "github") => {
  const { serverURL } = useGlobalStore.getState();
  const baseUrl = serverURL.replace(/\/+$/, "");
  const loginUrl = `${baseUrl}/auth/login/${provider}?client=${flags.device}`;
  return loginUrl;
};
