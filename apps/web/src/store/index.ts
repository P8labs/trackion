import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SERVER_URL } from "@/lib/constants";
import type { Project, User } from "@/types";

type State = {
  serverUrl: string;
  authToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  setAuth: (token: string, serverUrl: string, user?: User) => void;
  logout: () => void;

  // TODO REMOVE!!
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      serverUrl: SERVER_URL,
      authToken: null,
      user: null,
      currentProject: null,
      isAuthenticated: false,

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
          currentProject: null,
          isAuthenticated: false,
          serverUrl: SERVER_URL,
        }),

      setCurrentProject: (project) => set({ currentProject: project }),
    }),
    { name: "trackion-state-v2" },
  ),
);
