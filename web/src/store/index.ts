import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, Project, User } from "../types";
import { SERVER_URL } from "@/lib/constants";
import { logout } from "@/lib/api";

interface AppState extends AuthState {
  currentProject: Project | null;
  setAuth: (token: string, serverUrl: string, user?: User) => void;
  logout: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      authToken: null,
      serverUrl: SERVER_URL,
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
      logout: async () => {
        await logout(SERVER_URL, useStore.getState().authToken!);
        set({
          authToken: null,
          user: null,
          isAuthenticated: false,
          currentProject: null,
          serverUrl: SERVER_URL,
        });
      },
      setCurrentProject: (project) => set({ currentProject: project }),
    }),
    { name: "trackion-state-v1" },
  ),
);
