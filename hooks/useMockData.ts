
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// A simple hook to simulate async data fetching.
// In a real app, this would be replaced by a data fetching library like React Query or SWR.
// FIX: Use Dispatch and SetStateAction types from 'react' import to fix namespace error.
export function useMockData<T>(initialData: T | null, delay = 200): { data: T | null; setData: Dispatch<SetStateAction<T | null>>; isLoading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setData(initialData);
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [initialData, delay]);

  return { data, setData, isLoading };
}
