import { createUserMutations, createUserQueries } from "./user";
import { createProjectQueries } from "./project";
import type { createApi } from "../api";

export function createQueries(api: ReturnType<typeof createApi>) {
  return {
    user: createUserQueries(api),
    project: createProjectQueries(api),
  };
}

export function createMutations(api: ReturnType<typeof createApi>) {
  return {
    user: createUserMutations(api),
  };
}
