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
  setupServerUrl: (url: string) => void;
};

const GlobalContext = createContext<GlobalContextType | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const store = useStore.getState();
  const [authToken, setAuthToken] = useState(store.authToken);
  const [serverUrl, setServerUrl] = useState(store.serverUrl);

  const login = (token: string) => {
    setAuthToken(token);
    store.setAuth(token, store.serverUrl);
  };

  const setupServerUrl = (url: string) => {
    setServerUrl(url);
    store.setServerUrl(url);
  };

  const api = useMemo(() => {
    const client = createApiClient({
      baseUrl: serverUrl,
      getAuthToken: () => authToken,
    });

    return createApi(client);
  }, [authToken, serverUrl]);

  const loginUrls = useMemo(() => {
    const baseUrl = serverUrl.replace(/\/+$/, "");
    return {
      google: `${baseUrl}/auth/login/google?client=desktop`,
      github: `${baseUrl}/auth/login/github?client=desktop`,
    };
  }, [serverUrl]);

  return (
    <GlobalContext.Provider value={{ api, loginUrls, login, setupServerUrl }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used inside GlobalProvider");
  return ctx;
}
