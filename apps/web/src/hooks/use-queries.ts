import { useMemo } from "react";
import { createMutations, createQueries } from "@trackion/lib/queries";

import { useGlobalStore } from "@/store";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

export function useAppQuery<TData>(
  query: {
    queryKey: readonly unknown[];
    queryFn: () => Promise<TData>;
  },
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">,
) {
  const isAuthenticated = useGlobalStore((s) => s.authToken) !== null;

  return useQuery({
    ...query,
    enabled: options?.enabled ?? isAuthenticated,
    ...options,
  });
}

export function useAppMutation<TVars, TRes>(
  mutation: { mutationFn: (vars: TVars) => Promise<TRes> },
  options?: { onSuccess?: any },
) {
  const qc = useQueryClient();

  return useMutation({
    ...mutation,
    onSuccess: (res, vars) => {
      options?.onSuccess?.(qc, vars, res);
    },
  });
}

export function useMutations() {
  const { api } = useGlobalStore();
  return useMemo(() => createMutations(api()), [api]);
}
export function useQueries() {
  const { api } = useGlobalStore();
  return useMemo(() => createQueries(api()), [api]);
}
