import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, Project } from "../types";

interface AppState extends AuthState {
  currentProject: Project | null;
  setAuth: (token: string, serverUrl: string, user?: any) => void;
  logout: () => void;
  setCurrentProject: (project: Project | null) => void;
}

const serverUrl = import.meta.env.SERVER_URL || "http://localhost:8000";

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      authToken: null,
      serverUrl: serverUrl,
      user: null,
      isAuthenticated: false,
      currentProject: null,
      setAuth: (token, serverUrl, user) =>
        set({
          authToken: token,
          serverUrl,
          user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          authToken: null,
          user: null,
          isAuthenticated: false,
          currentProject: null,
          serverUrl: serverUrl,
        }),
      setCurrentProject: (project) => set({ currentProject: project }),
    }),
    { name: "trackion-state-v1" },
  ),
);
