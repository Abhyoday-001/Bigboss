import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePollingOptions<T> {
  intervalMs?: number; // Default 4000ms (3-5s per PRD.md §7)
  enabled?: boolean;
  initialData?: T;
  onError?: (err: Error) => void;
}

export function usePolling<T>(
  fetcher: () => Promise<T> | T,
  options: UsePollingOptions<T> = {}
) {
  const {
    intervalMs = 4000,
    enabled = true,
    initialData,
    onError,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const executeFetch = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      if (onError) {
        onError(errorObj);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    if (!enabled) return;

    // Initial immediate fetch
    executeFetch();

    // Setup interval for polling
    const intervalId = setInterval(() => {
      // Pause polling if document is hidden to conserve resources
      if (document.visibilityState === 'visible') {
        executeFetch();
      }
    }, intervalMs);

    // Resync when user tabs back into the window
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        executeFetch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, intervalMs, executeFetch]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch: executeFetch,
  };
}
