import { useStore } from "@/store";
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
    return useAppQuery(q.user.serverHealth(useStore((s) => s.serverUrl)));
  },

  useUsage() {
    const q = useQueries();
    return useAppQuery(q.user.usage());
  },

  usePlanInfo() {
    const q = useQueries();
    return useAppQuery(q.user.planInfo());
  },

  useLoginWithToken() {
    const m = useMutations();
    return useAppMutation(m.user.loginWithToken());
  },

  useLogout() {
    const m = useMutations();
    return useAppMutation(m.user.logout());
  },
};
