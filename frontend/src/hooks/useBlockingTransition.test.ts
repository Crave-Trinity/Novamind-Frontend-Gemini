/**
 * NOVAMIND Neural Test Suite
 * useBlockingTransition testing with quantum precision
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react"; // Import renderHook and act

import { useBlockingTransition } from "@/hooks/useBlockingTransition";

describe("useBlockingTransition", () => {
  it("should initialize with the provided initial state and isPending as false", () => {
    // Arrange
    const initialState = { count: 0 };

    // Act
    const { result } = renderHook(() => useBlockingTransition(initialState));

    // Assert
    expect(result.current.state).toEqual(initialState);
    expect(result.current.isPending).toBe(false);
  });

  it("should update state correctly using the transition setter", async () => {
    // Arrange
    const initialState = { value: "initial" };
    const newState = { value: "updated" };
    const { result } = renderHook(() => useBlockingTransition(initialState));

    // Act
    // Wrap the state update in act to handle React state updates correctly
    await act(async () => {
      result.current.setState(newState);
      // Note: In a real browser, useTransition might make isPending true briefly.
      // In JSDOM/Vitest, transitions often complete synchronously or very quickly.
      // We might not reliably observe isPending=true unless the update is computationally heavy.
    });

    // Assert
    expect(result.current.state).toEqual(newState);
    // isPending should ideally return to false after the transition completes
    expect(result.current.isPending).toBe(false);
  });

   it("should handle functional updates in the transition setter", async () => {
    // Arrange
    const initialState = { count: 5 };
    const increment = (prevState: { count: number }) => ({ count: prevState.count + 1 });
     const { result } = renderHook(() => useBlockingTransition(initialState));

    // Act
    await act(async () => {
      result.current.setState(increment);
    });

    // Assert
    expect(result.current.state).toEqual({ count: 6 });
    expect(result.current.isPending).toBe(false);
  });

  // Note: Testing the exact timing and value of `isPending` during the transition
  // can be tricky in a JSDOM environment as transitions might resolve faster
  // than in a real browser. More complex scenarios might require mocking timers
  // or using more advanced async utilities if precise pending state verification is needed.
});
