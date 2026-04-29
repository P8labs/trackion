import { createContext, useContext, useMemo } from "react";
import { createApi, createApiClient } from "@trackion/lib/api";
import { useStore } from "@/store";

type GlobalContextType = {
  api: ReturnType<typeof createApi>;
  loginUrls: {
    google: string;
    github: string;
  };
};

const GlobalContext = createContext<GlobalContextType | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const store = useStore.getState();
  const api = useMemo(() => {
    const client = createApiClient({
      baseUrl: store.serverUrl,
      getAuthToken: () => store.authToken,
    });

    return createApi(client);
  }, []);

  const loginUrls = useMemo(() => {
    const baseUrl = store.serverUrl.replace(/\/+$/, "");
    return {
      google: `${baseUrl}/api/auth/google`,
      github: `${baseUrl}/api/auth/github`,
    };
  }, [store.serverUrl]);

  return (
    <GlobalContext.Provider value={{ api, loginUrls }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used inside GlobalProvider");
  return ctx;
}
