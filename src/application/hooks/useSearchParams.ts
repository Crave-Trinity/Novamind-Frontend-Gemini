/* eslint-disable */
/**
 * NOVAMIND Neural-Safe Application Hook
 * useSearchParams - Hook for managing URL search parameters
 * Uses react-router-dom v6+ hooks
 */

import { useCallback } from 'react';
import { useSearchParams as useReactRouterSearchParams } from 'react-router-dom';

// Define the structure for the state object if needed (example)
interface SearchState {
  region?: string;
  detail?: string;
  stats?: string;
  labels?: string;
  // Add other expected params here
}

interface UseSearchParamsReturn {
  getParam: (key: string) => string | null;
  setParam: (key: string, value: string | number | boolean | null | undefined) => void;
  setParams: (params: Record<string, string | number | boolean | null | undefined>) => void;
  deleteParam: (key: string) => void;
  clearParams: () => void;
  serializeState: () => Record<string, string>; // Function to get all current params as an object
  deserializeState: (defaultState?: Partial<SearchState>) => SearchState; // Function to parse params into a state object
}

export function useSearchParams(): UseSearchParamsReturn {
  const [searchParams, setSearchParams] = useReactRouterSearchParams();
  // Removed unused variables: navigate, location

  const getParam = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  const setParam = useCallback(
    (key: string, value: string | number | boolean | null | undefined) => {
      const newSearchParams = new URLSearchParams(searchParams);
      if (value === null || value === undefined) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
      setSearchParams(newSearchParams, { replace: true }); // Use replace to avoid history stack pollution
    },
    [searchParams, setSearchParams]
  );

  const setParams = useCallback(
    (params: Record<string, string | number | boolean | null | undefined>) => {
      const newSearchParams = new URLSearchParams(searchParams);
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });
      setSearchParams(newSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const deleteParam = useCallback(
    (key: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete(key);
      setSearchParams(newSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const clearParams = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const serializeState = useCallback((): Record<string, string> => {
    const queryObj: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      queryObj[key] = val;
    });
    return queryObj;
  }, [searchParams]);

  // Example deserialization - adjust based on actual state structure needed
  const deserializeState = useCallback(
    (defaultState: Partial<SearchState> = {}): SearchState => {
      const state: SearchState = { ...defaultState };
      searchParams.forEach((value, key) => {
        if (key in state) {
          // Basic type coercion - might need more robust parsing
          if (typeof (state as any)[key] === 'boolean') {
            (state as any)[key] = value === 'true';
          } else if (typeof (state as any)[key] === 'number') {
            (state as any)[key] = parseFloat(value);
          } else {
            (state as any)[key] = value;
          }
        } else {
          // Handle unexpected params if necessary
          (state as any)[key] = value;
        }
      });
      return state;
    },
    [searchParams]
  );

  return {
    getParam,
    setParam,
    setParams,
    deleteParam,
    clearParams,
    serializeState,
    deserializeState,
  };
}
