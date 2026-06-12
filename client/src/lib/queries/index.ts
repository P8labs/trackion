import type { createApi } from "../api";
import { createUserMutations, createUserQueries } from "./user";
import { createProjectMutations, createProjectQueries } from "./project";
import { createAnalyticsQueries } from "./analytics";

export function createQueries(api: ReturnType<typeof createApi>) {
  return {
    user: createUserQueries(api),
    project: createProjectQueries(api),
    analytics: createAnalyticsQueries(api),
  };
}

export function createMutations(api: ReturnType<typeof createApi>) {
  return {
    user: createUserMutations(api),
    project: createProjectMutations(api),
  };
}

export type Queries = ReturnType<typeof createQueries>;
export type Mutations = ReturnType<typeof createMutations>;
export { analyticsQueryKeys } from "./analytics";
export { projectQueryKeys } from "./project";
export { userQueryKeys } from "./user";
