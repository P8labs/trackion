import { createContext, useContext, useMemo, useState } from "react";
import { createApi, createApiClient } from "@trackion/lib/api";
import { useStore } from "@/store";

type GlobalContextType = {
  api: ReturnType<typeof createApi>;
  loginUrls: {
    google: string;
    github: string;
  };
  login: (token: string) => void;
};

const GlobalContext = createContext<GlobalContextType | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const store = useStore.getState();
  const [authToken, setAuthToken] = useState(store.authToken);

  const login = (token: string) => {
    setAuthToken(token);
    store.setAuth(token, store.serverUrl);
  };
  const api = useMemo(() => {
    const client = createApiClient({
      baseUrl: store.serverUrl,
      getAuthToken: () => authToken,
    });

    return createApi(client);
  }, [authToken]);

  const loginUrls = useMemo(() => {
    const baseUrl = store.serverUrl.replace(/\/+$/, "");
    return {
      google: `${baseUrl}/auth/login/google?client=desktop`,
      github: `${baseUrl}/auth/login/github?client=desktop`,
    };
  }, [store.serverUrl]);

  return (
    <GlobalContext.Provider value={{ api, loginUrls, login }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used inside GlobalProvider");
  return ctx;
}
