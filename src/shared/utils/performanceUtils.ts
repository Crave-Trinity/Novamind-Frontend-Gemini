/**
 * Performance utilities for optimizing UI operations
 * Implements common performance patterns like debouncing and throttling
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last invocation.
 *
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the original function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per the specified wait time.
 *
 * @param func The function to throttle
 * @param limit The number of milliseconds to throttle invocations to
 * @returns A throttled version of the original function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;

  return function (...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan)
      );
    }
  };
}

/**
 * A hook that returns a debounced version of the window resize event handler.
 * Useful for preventing excessive re-renders during window resizing.
 *
 * @param callback The function to call on resize
 * @param delay The debounce delay in milliseconds
 */
export function useWindowResizeDebounced(callback: () => void, delay = 250): void {
  React.useEffect(() => {
    const handleResize = debounce(() => {
      callback();
    }, delay);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [callback, delay]);
}

/**
 * A hook that returns a throttled version of the scroll event handler.
 * Useful for preventing excessive calculations during scrolling.
 *
 * @param callback The function to call on scroll
 * @param delay The throttle delay in milliseconds
 */
export function useScrollThrottled(callback: () => void, delay = 100): void {
  React.useEffect(() => {
    const handleScroll = throttle(() => {
      callback();
    }, delay);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [callback, delay]);
}

/**
 * Schedules a DOM read operation to be performed in the next frame
 * to avoid layout thrashing.
 *
 * @param callback The function to call for reading DOM properties
 */
export function scheduleDOMRead(callback: () => void): void {
  requestAnimationFrame(() => {
    callback();
  });
}

/**
 * Schedules a DOM write operation to be performed in the next frame
 * after all scheduled reads to avoid layout thrashing.
 *
 * @param callback The function to call for writing to the DOM
 */
export function scheduleDOMWrite(callback: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      callback();
    });
  });
}

/**
 * Batches DOM reads and writes to prevent layout thrashing.
 * First performs all reads, then all writes.
 *
 * @param reads An array of functions that read from the DOM
 * @param writes An array of functions that write to the DOM
 */
export function batchDOMOperations(
  reads: Array<() => any>,
  writes: Array<(readResults: any[]) => void>
): void {
  requestAnimationFrame(() => {
    // Perform all reads first
    const readResults = reads.map((read) => read());

    // Then perform all writes
    requestAnimationFrame(() => {
      // Removed unused index 'i'
      writes.forEach((write) => write(readResults));
    });
  });
}

// Missing React import
import React from 'react';
