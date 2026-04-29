import { QueryClient } from "@tanstack/react-query";

let globalErrorHandler: ((error: Error) => void) | null = null;

export const setGlobalErrorHandler = (handler: (error: Error) => void) => {
  globalErrorHandler = handler;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (
          error instanceof Error &&
          (error.message.includes("401") ||
            error.message.includes("403") ||
            error.message.includes("Unauthorized") ||
            error.message.includes("Forbidden"))
        ) {
          if (globalErrorHandler) {
            globalErrorHandler(error);
          }
          return false;
        }

        if (
          error instanceof Error &&
          error.message.includes("Failed to fetch")
        ) {
          return failureCount < 3;
        }

        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (_, error) => {
        if (
          error instanceof Error &&
          (error.message.includes("401") ||
            error.message.includes("403") ||
            error.message.includes("Unauthorized") ||
            error.message.includes("Forbidden"))
        ) {
          if (globalErrorHandler) {
            globalErrorHandler(error);
          }
          return false;
        }

        return false;
      },
    },
  },
});
