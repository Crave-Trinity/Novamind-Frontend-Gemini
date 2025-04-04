/**
 * Performance Optimization Hooks
 *
 * A collection of hooks that implement React's useTransition for non-blocking UI updates
 * with additional clinical-grade optimizations for large psychiatric data processing.
 */

import { useTransition, useState, useCallback, useMemo } from "react";

/**
 * Custom hook that implements useTransition pattern for non-blocking UI updates
 * Useful for processing large datasets (like neural connectivity maps) without blocking the main thread
 *
 * @param initialState - The initial state value
 * @returns An object with functions to start a transition, set state, and access state
 */
export function useBlockingTransition<T>(initialState: T) {
  // State that will be updated in a non-blocking transition
  const [state, setStateDirectly] = useState<T>(initialState);

  // isPending will be true during the transition
  const [isPending, startTransition] = useTransition();

  /**
   * Updates state in a non-blocking transition
   * This prevents UI freezes when setting state with expensive computations
   * like neural pathway calculations or treatment response predictions
   */
  const setState = useCallback(
    (newState: T | ((prevState: T) => T)) => {
      startTransition(() => {
        setStateDirectly(newState);
      });
    },
    [startTransition],
  );

  return {
    state,
    setState,
    isPending,
    // Add direct setter for emergency/critical updates that must happen immediately
    setStateImmediate: setStateDirectly
  };
}

/**
 * Similar to useBlockingTransition but specialized for filtered lists
 * Allows for efficient filtering of large patient datasets without UI freezes
 *
 * @param initialItems - The initial array of items
 * @returns Functions for filtering and managing items with transition
 */
export function useFilteredListTransition<T>(initialItems: T[]) {
  // Original unfiltered items
  const [items, setItems] = useState<T[]>(initialItems);

  // Filtered items shown to the user
  const [filteredItems, setFilteredItems] = useState<T[]>(initialItems);

  // isPending will be true during filtering transition
  const [isPending, startTransition] = useTransition();

  /**
   * Updates the original items list
   * @param newItems - New array to replace current items
   */
  const updateItems = useCallback(
    (newItems: T[]) => {
      setItems(newItems);

      // Update filtered items in a non-blocking transition
      startTransition(() => {
        setFilteredItems(newItems);
      });
    },
    [startTransition],
  );

  /**
   * Applies a filter function to the items in a non-blocking transition
   * @param filterFn - Predicate function to filter items
   */
  const filterItems = useCallback(
    (filterFn: (item: T) => boolean) => {
      startTransition(() => {
        setFilteredItems(items.filter(filterFn));
      });
    },
    [items, startTransition],
  );

  /**
   * Resets filters to show all items
   */
  const resetFilters = useCallback(() => {
    startTransition(() => {
      setFilteredItems(items);
    });
  }, [items, startTransition]);

  // Memoize the return value to prevent unnecessary re-renders
  const api = useMemo(() => ({
    items,
    filteredItems,
    updateItems,
    filterItems,
    resetFilters,
    isPending,
  }), [items, filteredItems, updateItems, filterItems, resetFilters, isPending]);

  return api;
}

/**
 * Hook for batched state updates to avoid multiple re-renders
 * Collects state updates and applies them in a single batch,
 * critical for complex clinical visualization updates
 *
 * @param initialState - Initial state object
 * @returns Functions for queuing and applying batched updates
 */
export function useBatchedUpdates<T extends Record<string, any>>(
  initialState: T,
) {
  const [state, setState] = useState<T>(initialState);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<T>>({});
  const [isPending, startTransition] = useTransition();

  /**
   * Adds an update to the pending batch
   * @param key - State property key to update
   * @param value - New value for the property
   */
  const queueUpdate = useCallback((key: keyof T, value: any) => {
    setPendingUpdates((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Applies all pending updates in a single transition
   */
  const applyUpdates = useCallback(() => {
    if (Object.keys(pendingUpdates).length === 0) {
      return;
    }

    startTransition(() => {
      setState((prev) => ({
        ...prev,
        ...pendingUpdates,
      }));
      setPendingUpdates({});
    });
  }, [pendingUpdates, startTransition]);

  /**
   * Immediately applies a single update, bypassing the batch
   * Use only for critical updates that can't wait
   */
  const applyImmediate = useCallback((key: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Memoize the return value to prevent unnecessary re-renders
  const api = useMemo(() => ({
    state,
    queueUpdate,
    applyUpdates,
    applyImmediate,
    pendingUpdates,
    isPending,
    // Helper to check if specific keys have pending updates
    hasPendingUpdate: (key: keyof T) => key in pendingUpdates,
  }), [state, queueUpdate, applyUpdates, applyImmediate, pendingUpdates, isPending]);

  return api;
}