import { QueryClient } from "@tanstack/react-query";

// Global error handler that can logout user on auth errors
let globalErrorHandler: ((error: Error) => void) | null = null;

export const setGlobalErrorHandler = (handler: (error: Error) => void) => {
  globalErrorHandler = handler;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry for authentication errors (401, 403)
        if (
          error instanceof Error &&
          (error.message.includes("401") ||
            error.message.includes("403") ||
            error.message.includes("Unauthorized") ||
            error.message.includes("Forbidden"))
        ) {
          // Call global error handler for auth errors
          if (globalErrorHandler) {
            globalErrorHandler(error);
          }
          return false;
        }

        // Retry up to 3 times for network errors
        if (
          error instanceof Error &&
          error.message.includes("Failed to fetch")
        ) {
          return failureCount < 3;
        }

        // Retry once for other errors
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (_, error) => {
        // Never retry auth errors in mutations
        if (
          error instanceof Error &&
          (error.message.includes("401") ||
            error.message.includes("403") ||
            error.message.includes("Unauthorized") ||
            error.message.includes("Forbidden"))
        ) {
          // Call global error handler for auth errors
          if (globalErrorHandler) {
            globalErrorHandler(error);
          }
          return false;
        }

        // Don't retry mutations by default
        return false;
      },
    },
  },
});
