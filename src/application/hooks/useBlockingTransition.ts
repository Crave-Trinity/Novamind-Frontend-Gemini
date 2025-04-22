/* eslint-disable */
/**
 * Performance Optimization Hooks
 *
 * A collection of hooks that implement React's useTransition for non-blocking UI updates
 * with additional clinical-grade optimizations for large psychiatric data processing.
 */

import { useTransition, useState, useCallback, useMemo } from 'react';

/**
 * Custom hook that implements useTransition pattern for non-blocking UI updates
 * Useful for processing large datasets (like neural connectivity maps) without blocking the main thread
 *
 * @param initialState - The initial state value
 * @returns An object with functions to start a transition, set state, and access state
 */
// eslint-disable-next-line
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
    // eslint-disable-next-line
    (newState: T | ((prevState: T) => T)) => {
      // eslint-disable-next-line
      startTransition(() => {
        setStateDirectly(newState);
      });
    },
    [startTransition]
  );

  return {
    state,
    setState,
    isPending,
    // Add direct setter for emergency/critical updates that must happen immediately
    setStateImmediate: setStateDirectly,
  };
}

/**
 * Similar to useBlockingTransition but specialized for filtered lists
 * Allows for efficient filtering of large patient datasets without UI freezes
 *
 * @param initialItems - The initial array of items
 * @returns Functions for filtering and managing items with transition
 */
// eslint-disable-next-line
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
    // eslint-disable-next-line
    (newItems: T[]) => {
      setItems(newItems);

      // Update filtered items in a non-blocking transition
      // eslint-disable-next-line
      startTransition(() => {
        setFilteredItems(newItems);
      });
    },
    [startTransition]
  );

  /**
   * Applies a filter function to the items in a non-blocking transition
   * @param filterFn - Predicate function to filter items
   */
  const filterItems = useCallback(
    // eslint-disable-next-line
    (filterFn: (item: T) => boolean) => {
      // eslint-disable-next-line
      startTransition(() => {
        setFilteredItems(items.filter(filterFn));
      });
    },
    [items, startTransition]
  );

  /**
   * Resets filters to show all items
   */
  // eslint-disable-next-line
  const resetFilters = useCallback(() => {
    // eslint-disable-next-line
    startTransition(() => {
      setFilteredItems(items);
    });
  }, [items, startTransition]);

  // Memoize the return value to prevent unnecessary re-renders
  const api = useMemo(
    // eslint-disable-next-line
    () => ({
      items,
      filteredItems,
      updateItems,
      filterItems,
      resetFilters,
      isPending,
    }),
    [items, filteredItems, updateItems, filterItems, resetFilters, isPending]
  );

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useBatchedUpdates<T extends Record<string, any>>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<T>>({});
  const [isPending, startTransition] = useTransition();

  /**
   * Adds an update to the pending batch
   * @param key - State property key to update
   * @param value - New value for the property
   */
  const queueUpdate = useCallback((key: keyof T, value: T[keyof T]) => {
    // Use T[keyof T] for better type safety
    setPendingUpdates((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []); // Dependency array is empty as setPendingUpdates is stable

  /**
   * Applies all pending updates in a single transition
   */
  const applyUpdates = useCallback(() => {
    if (Object.keys(pendingUpdates).length === 0) {
      return; // No updates to apply
    }

    startTransition(() => {
      setState((prev) => ({
        ...prev,
        ...pendingUpdates, // Apply all queued updates
      }));
      setPendingUpdates({}); // Clear the queue after applying
    });
  }, [pendingUpdates, startTransition, setState, setPendingUpdates]); // Include all dependencies

  /**
   * Immediately applies a single update, bypassing the batch
   * Use only for critical updates that can't wait
   */
  const applyImmediate = useCallback(
    (key: keyof T, value: T[keyof T]) => {
      // Use T[keyof T]
      setState((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setState]
  ); // Include setState dependency

  // Memoize the return value to prevent unnecessary re-renders
  const api = useMemo(
    () => ({
      state,
      queueUpdate,
      applyUpdates,
      applyImmediate,
      pendingUpdates,
      isPending,
      // Helper to check if specific keys have pending updates
      hasPendingUpdate: (key: keyof T): boolean => key in pendingUpdates,
    }),
    [state, queueUpdate, applyUpdates, applyImmediate, pendingUpdates, isPending] // Match dependencies
  );

  return api;
}
