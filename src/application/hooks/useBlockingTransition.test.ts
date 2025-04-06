/**
 * NOVAMIND Neural Test Suite
 * useBlockingTransition testing with quantum precision
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import {
  useBlockingTransition,
  useFilteredListTransition,
  useBatchedUpdates,
} from '@application/hooks/useBlockingTransition';

describe('useBlockingTransition', () => {
  it('should initialize with the provided initial state and isPending as false', () => {
    // Arrange
    const initialState = { count: 0 };

    // Act
    const { result } = renderHook(() => useBlockingTransition(initialState));

    // Assert
    expect(result.current.state).toEqual(initialState);
    expect(result.current.isPending).toBe(false);
  });

  it('should update state correctly using the transition setter', async () => {
    // Arrange
    const initialState = { value: 'initial' };
    const newState = { value: 'updated' };
    const { result } = renderHook(() => useBlockingTransition(initialState));

    // Act
    await act(async () => {
      result.current.setState(newState);
    });

    // Assert
    expect(result.current.state).toEqual(newState);
    expect(result.current.isPending).toBe(false);
  });

  it('should handle functional updates in the transition setter', async () => {
    // Arrange
    const initialState = { count: 5 };
    const increment = (prevState: { count: number }) => ({
      count: prevState.count + 1,
    });
    const { result } = renderHook(() => useBlockingTransition(initialState));

    // Act
    await act(async () => {
      result.current.setState(increment);
    });

    // Assert
    expect(result.current.state).toEqual({ count: 6 });
    expect(result.current.isPending).toBe(false);
  });

  // Test the new immediate setter feature
  it('should update state immediately using the immediate setter', () => {
    // Arrange
    const initialState = { count: 0 };
    const { result } = renderHook(() => useBlockingTransition(initialState));

    // Act - no async/await needed for immediate updates
    act(() => {
      result.current.setStateImmediate({ count: 10 });
    });

    // Assert
    expect(result.current.state).toEqual({ count: 10 });
  });
});

describe('useFilteredListTransition', () => {
  it('should initialize with the provided initial items', () => {
    // Arrange
    const initialItems = [1, 2, 3, 4, 5];

    // Act
    const { result } = renderHook(() => useFilteredListTransition(initialItems));

    // Assert
    expect(result.current.items).toEqual(initialItems);
    expect(result.current.filteredItems).toEqual(initialItems);
    expect(result.current.isPending).toBe(false);
  });

  it('should update all items and filtered items when updateItems is called', async () => {
    // Arrange
    const initialItems = [1, 2, 3, 4, 5];
    const newItems = [6, 7, 8, 9, 10];
    const { result } = renderHook(() => useFilteredListTransition(initialItems));

    // Act
    await act(async () => {
      result.current.updateItems(newItems);
    });

    // Assert
    expect(result.current.items).toEqual(newItems);
    expect(result.current.filteredItems).toEqual(newItems);
  });

  it('should filter items correctly when filterItems is called', async () => {
    // Arrange
    const initialItems = [1, 2, 3, 4, 5];
    const evenFilter = (num: number) => num % 2 === 0;
    const { result } = renderHook(() => useFilteredListTransition(initialItems));

    // Act
    await act(async () => {
      result.current.filterItems(evenFilter);
    });

    // Assert
    expect(result.current.items).toEqual(initialItems); // Original items unchanged
    expect(result.current.filteredItems).toEqual([2, 4]); // Only even numbers
  });

  it('should reset filters when resetFilters is called', async () => {
    // Arrange
    const initialItems = [1, 2, 3, 4, 5];
    const evenFilter = (num: number) => num % 2 === 0;
    const { result } = renderHook(() => useFilteredListTransition(initialItems));

    // Act - First filter, then reset
    await act(async () => {
      result.current.filterItems(evenFilter);
    });
    await act(async () => {
      result.current.resetFilters();
    });

    // Assert
    expect(result.current.filteredItems).toEqual(initialItems); // Back to showing all items
  });
});

describe('useBatchedUpdates', () => {
  it('should initialize with the provided initial state', () => {
    // Arrange
    const initialState = { name: 'John', age: 30 };

    // Act
    const { result } = renderHook(() => useBatchedUpdates(initialState));

    // Assert
    expect(result.current.state).toEqual(initialState);
    expect(result.current.pendingUpdates).toEqual({});
    expect(result.current.isPending).toBe(false);
  });

  it('should queue updates without modifying state', () => {
    // Arrange
    const initialState = { name: 'John', age: 30 };
    const { result } = renderHook(() => useBatchedUpdates(initialState));

    // Act
    act(() => {
      result.current.queueUpdate('name', 'Jane');
      result.current.queueUpdate('age', 31);
    });

    // Assert
    expect(result.current.state).toEqual(initialState); // State unchanged
    expect(result.current.pendingUpdates).toEqual({ name: 'Jane', age: 31 }); // Updates queued
    expect(result.current.hasPendingUpdate('name')).toBe(true);
    expect(result.current.hasPendingUpdate('age')).toBe(true);
  });

  it('should apply all queued updates when applyUpdates is called', async () => {
    // Arrange
    const initialState = { name: 'John', age: 30 };
    const { result } = renderHook(() => useBatchedUpdates(initialState));

    // Act - Queue then apply
    act(() => {
      result.current.queueUpdate('name', 'Jane');
      result.current.queueUpdate('age', 31);
    });
    await act(async () => {
      result.current.applyUpdates();
    });

    // Assert
    expect(result.current.state).toEqual({ name: 'Jane', age: 31 });
    expect(result.current.pendingUpdates).toEqual({}); // Queue emptied
  });

  it('should apply immediate updates bypassing the queue', () => {
    // Arrange
    const initialState = { name: 'John', age: 30 };
    const { result } = renderHook(() => useBatchedUpdates(initialState));

    // Act - Queue one update but apply another immediately
    act(() => {
      result.current.queueUpdate('age', 31);
      result.current.applyImmediate('name', 'Jane');
    });

    // Assert
    expect(result.current.state).toEqual({ name: 'Jane', age: 30 }); // Only name updated
    expect(result.current.pendingUpdates).toEqual({ age: 31 }); // Age still in queue
  });
});
