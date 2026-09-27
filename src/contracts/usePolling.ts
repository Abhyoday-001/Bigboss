import { useState, useEffect } from 'react';

// MOCK: Swap for real usePolling implementation from Aryan
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number = 3000,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const result = await fetchFn();
        if (isMounted) {
          setData(result);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Polling error'));
          setLoading(false);
        }
      }
    };

    poll(); // initial fetch
    const timer = setInterval(poll, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, intervalMs]);

  return { data, loading, error };
}
