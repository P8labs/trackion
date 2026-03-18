import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, Project } from "../types";

interface AppState extends AuthState {
  currentProject: Project | null;
  theme: "light" | "dark";
  setAuth: (token: string, serverUrl: string, user?: any) => void;
  logout: () => void;
  setCurrentProject: (project: Project | null) => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      authToken: null,
      serverUrl: "http://localhost:8000",
      user: null,
      isAuthenticated: false,
      currentProject: null,
      theme: "dark",
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
        }),
      setCurrentProject: (project) => set({ currentProject: project }),
      setTheme: (theme) => {
        set({ theme });
        // Toggle the dark class on the document element
        if (typeof document !== "undefined") {
          // Ensure clean state before setting
          document.documentElement.classList.remove("light", "dark");
          if (theme === "dark") {
            document.documentElement.classList.add("dark");
          }
          // light theme is default, no class needed
        }
      },
    }),
    {
      name: "trackion-storage",
      onRehydrateStorage: () => (state) => {
        // Initialize theme class on document element after rehydration
        if (state && typeof document !== "undefined") {
          // Ensure clean state first
          document.documentElement.classList.remove("light", "dark");
          if (state.theme === "dark") {
            document.documentElement.classList.add("dark");
          }
          // light theme is the default, no class needed
        }
      },
    },
  ),
);
