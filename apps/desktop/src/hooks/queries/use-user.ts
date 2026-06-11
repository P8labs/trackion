import {
  useAppMutation,
  useAppQuery,
  useMutations,
  useQueries,
} from "../use-queries";

export const userHooks = {
  useUser() {
    const q = useQueries();
    return useAppQuery(q.user.user());
  },

  useServerHealth() {
    const q = useQueries();
    return useAppQuery(q.user.serverHealth());
  },

  useUsage() {
    const q = useQueries();
    return useAppQuery(q.user.usage());
  },

  useLogout() {
    const m = useMutations();
    return useAppMutation(m.user.logout());
  },
};
