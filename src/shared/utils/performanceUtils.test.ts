/**
 * NOVAMIND Neural Test Suite
 * debounce testing with quantum precision
 */

import { describe, it, expect, vi } from 'vitest'; // Added vi import

import { debounce } from './performanceUtils'; // Use relative path

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // Use fake timers for debounce testing
  });

  it('should only call the function after the delay', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    // Should not be called yet
    expect(func).not.toHaveBeenCalled();

    // Fast-forward time
    vi.advanceTimersByTime(100);

    // Should have been called once now
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the debounced function', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);
    const arg1 = { a: 1 };
    const arg2 = 'test';

    debouncedFunc(arg1, arg2);

    vi.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(arg1, arg2);
  });

  it('should reset the timer if called again within the delay', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc(); // Call 1
    vi.advanceTimersByTime(50);
    debouncedFunc(); // Call 2 (resets timer)

    // Advance past original timeout, should not have fired yet
    vi.advanceTimersByTime(50);
    expect(func).not.toHaveBeenCalled();

    // Advance past the reset timeout
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
  });

  // Restore real timers after tests
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers(); // Restore real timers after each test
  });
});
