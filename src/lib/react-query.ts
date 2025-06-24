import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 401 (handled by interceptor)
        if (error?.statusCode >= 400 && error?.statusCode < 500 && error?.statusCode !== 401) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        if (error?.statusCode >= 400 && error?.statusCode < 500) {
          return false;
        }
        // Retry up to 2 times for server errors
        return failureCount < 2;
      },
    },
  },
});

export { QueryClient } from '@tanstack/react-query';