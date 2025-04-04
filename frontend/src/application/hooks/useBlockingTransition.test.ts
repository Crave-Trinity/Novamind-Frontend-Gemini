/**
 * Tests for useBlockingTransition hooks
 *
 * These tests validate the performance optimization hooks used in the
 * psychiatric visualization system for non-blocking UI updates.
 */

import { renderHook, act } from "@testing-library/react";
import {
  useBlockingTransition,
  useFilteredListTransition,
  useBatchedUpdates,
} from "./useBlockingTransition";

describe("useBlockingTransition", () => {
  it("should initialize with the provided state", () => {
    const { result } = renderHook(() => useBlockingTransition("initial"));
    expect(result.current.state).toBe("initial");
  });

  it("should update state in a transition", async () => {
    const { result } = renderHook(() => useBlockingTransition("initial"));

    act(() => {
      result.current.setState("updated");
    });

    // In tests, transitions happen synchronously
    expect(result.current.state).toBe("updated");
  });

  it("should handle functional updates correctly", () => {
    const { result } = renderHook(() => useBlockingTransition({ count: 0 }));

    act(() => {
      result.current.setState((prev) => ({ count: prev.count + 1 }));
    });

    expect(result.current.state).toEqual({ count: 1 });
  });

  it("should provide immediate update capability", () => {
    const { result } = renderHook(() => useBlockingTransition("initial"));

    act(() => {
      result.current.setStateImmediate("emergency update");
    });

    expect(result.current.state).toBe("emergency update");
  });
});

describe("useFilteredListTransition", () => {
  const initialItems = [1, 2, 3, 4, 5];

  it("should initialize with the provided items", () => {
    const { result } = renderHook(() => useFilteredListTransition(initialItems));
    expect(result.current.items).toEqual(initialItems);
    expect(result.current.filteredItems).toEqual(initialItems);
  });

  it("should update all items", () => {
    const { result } = renderHook(() => useFilteredListTransition(initialItems));
    const newItems = [6, 7, 8];

    act(() => {
      result.current.updateItems(newItems);
    });

    expect(result.current.items).toEqual(newItems);
    expect(result.current.filteredItems).toEqual(newItems);
  });

  it("should filter items correctly", () => {
    const { result } = renderHook(() => useFilteredListTransition(initialItems));

    act(() => {
      result.current.filterItems((item) => item % 2 === 0);
    });

    expect(result.current.items).toEqual(initialItems);
    expect(result.current.filteredItems).toEqual([2, 4]);
  });

  it("should reset filters", () => {
    const { result } = renderHook(() => useFilteredListTransition(initialItems));

    act(() => {
      result.current.filterItems((item) => item % 2 === 0);
    });

    expect(result.current.filteredItems).toEqual([2, 4]);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filteredItems).toEqual(initialItems);
  });
});

describe("useBatchedUpdates", () => {
  const initialState = { name: "John", age: 30, active: false };

  it("should initialize with the provided state", () => {
    const { result } = renderHook(() => useBatchedUpdates(initialState));
    expect(result.current.state).toEqual(initialState);
  });

  it("should queue updates without changing state", () => {
    const { result } = renderHook(() => useBatchedUpdates(initialState));

    act(() => {
      result.current.queueUpdate("name", "Jane");
      result.current.queueUpdate("age", 31);
    });

    expect(result.current.state).toEqual(initialState); // State unchanged
    expect(result.current.pendingUpdates).toEqual({ name: "Jane", age: 31 }); // Updates queued
  });

  it("should apply all pending updates at once", () => {
    const { result } = renderHook(() => useBatchedUpdates(initialState));

    act(() => {
      result.current.queueUpdate("name", "Jane");
      result.current.queueUpdate("age", 31);
      result.current.applyUpdates();
    });

    expect(result.current.state).toEqual({
      name: "Jane",
      age: 31,
      active: false,
    });
    expect(result.current.pendingUpdates).toEqual({}); // Pending updates cleared
  });

  it("should detect pending updates correctly", () => {
    const { result } = renderHook(() => useBatchedUpdates(initialState));

    act(() => {
      result.current.queueUpdate("name", "Jane");
    });

    expect(result.current.hasPendingUpdate("name")).toBe(true);
    expect(result.current.hasPendingUpdate("age")).toBe(false);
  });

  it("should apply immediate updates bypassing the batch", () => {
    const { result } = renderHook(() => useBatchedUpdates(initialState));

    act(() => {
      result.current.queueUpdate("name", "Jane");
      result.current.applyImmediate("active", true);
    });

    expect(result.current.state).toEqual({
      name: "John", // Still original (not applied from queue)
      age: 30,
      active: true, // Updated immediately
    });
    
    expect(result.current.pendingUpdates).toEqual({ name: "Jane" }); // Still in queue
  });
});