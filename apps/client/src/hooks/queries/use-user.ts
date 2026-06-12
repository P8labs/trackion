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

  useSubscriptionPlans() {
    const q = useQueries();
    return useAppQuery(q.user.subscriptionPlans());
  },

  useSubscribeToPlan() {
    const m = useMutations();
    return useAppMutation(m.user.setupSubscription());
  },

  useLoginWithEmail() {
    const m = useMutations();
    return useAppMutation(m.user.loginWithEmail());
  },

  useSignUpWithEmail() {
    const m = useMutations();
    return useAppMutation(m.user.signupWithEmail());
  },

  useResetPassword() {
    const m = useMutations();
    return useAppMutation(m.user.resetPassword());
  },

  useRequestPasswordReset() {
    const m = useMutations();
    return useAppMutation(m.user.requestPasswordReset());
  },

  useRequestEmailVerification() {
    const m = useMutations();
    return useAppMutation(m.user.requestEmailVerification());
  },

  useVerifyEmail() {
    const m = useMutations();
    return useAppMutation(m.user.verifyEmail());
  },

  useLogout() {
    const m = useMutations();
    return useAppMutation(m.user.logout());
  },
};
