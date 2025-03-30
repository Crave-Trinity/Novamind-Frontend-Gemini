import { useTransition, useState, useCallback } from "react";

/**
 * Custom hook that implements useTransition pattern for non-blocking UI updates
 * Useful for processing large datasets without blocking the main thread
 *
 * @returns An object with functions to start a transition, set state, and access state
 */
export function useBlockingTransition<T>(initialState: T) {
  // State that will be updated in a non-blocking transition
  const [state, setState] = useState<T>(initialState);

  // isPending will be true during the transition
  const [isPending, startTransition] = useTransition();

  /**
   * Updates state in a non-blocking transition
   * This prevents UI freezes when setting state with expensive computations
   */
  const setStateInTransition = useCallback(
    (newState: T | ((prevState: T) => T)) => {
      startTransition(() => {
        setState(newState);
      });
    },
    [startTransition],
  );

  return {
    state,
    setState: setStateInTransition,
    isPending,
  };
}

/**
 * Similar to useBlockingTransition but specialized for filtered lists
 * Allows for efficient filtering of large datasets without UI freezes
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

  return {
    items,
    filteredItems,
    updateItems,
    filterItems,
    resetFilters,
    isPending,
  };
}

/**
 * Hook for batched state updates to avoid multiple re-renders
 * Collects state updates and applies them in a single batch
 */
export function useBatchedUpdates<T extends Record<string, any>>(
  initialState: T,
) {
  const [state, setState] = useState<T>(initialState);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<T>>({});
  const [isPending, startTransition] = useTransition();

  /**
   * Adds an update to the pending batch
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

  return {
    state,
    queueUpdate,
    applyUpdates,
    pendingUpdates,
    isPending,
  };
}
