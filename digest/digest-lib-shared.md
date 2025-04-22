This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.
The content has been processed where content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/lib/**, src/shared/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

## Additional Info

# Directory Structure
```
src/
  lib/
    utils.test.ts
    utils.ts
  shared/
    utils/
      cn.ts
      performanceUtils.test.ts
      performanceUtils.ts
```

# Files

## File: src/shared/utils/cn.ts
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
⋮----
/**
 * Combines class names using clsx and merges Tailwind classes using tailwind-merge.
 * Ensures proper handling of conflicting Tailwind utility classes.
 * @param inputs - Class values to combine and merge.
 * @returns The merged class name string.
 */
export function cn(...inputs: ClassValue[])
```

## File: src/shared/utils/performanceUtils.test.ts
```typescript
/**
 * NOVAMIND Neural Test Suite
 * debounce testing with quantum precision
 */
⋮----
import { describe, it, expect, vi } from 'vitest'; // Added vi import
⋮----
import { debounce } from './performanceUtils'; // Use relative path
⋮----
vi.useFakeTimers(); // Use fake timers for debounce testing
⋮----
// Should not be called yet
⋮----
// Fast-forward time
⋮----
// Should have been called once now
⋮----
debouncedFunc(); // Call 1
⋮----
debouncedFunc(); // Call 2 (resets timer)
⋮----
// Advance past original timeout, should not have fired yet
⋮----
// Advance past the reset timeout
⋮----
// Restore real timers after tests
⋮----
vi.useRealTimers(); // Restore real timers after each test
```

## File: src/shared/utils/performanceUtils.ts
```typescript
/**
 * Performance utilities for optimizing UI operations
 * Implements common performance patterns like debouncing and throttling
 */
⋮----
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
): (...args: Parameters<T>) => void
⋮----
const later = () =>
⋮----
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
): (...args: Parameters<T>) => void
⋮----
/**
 * A hook that returns a debounced version of the window resize event handler.
 * Useful for preventing excessive re-renders during window resizing.
 *
 * @param callback The function to call on resize
 * @param delay The debounce delay in milliseconds
 */
export function useWindowResizeDebounced(callback: () => void, delay = 250): void
⋮----
/**
 * A hook that returns a throttled version of the scroll event handler.
 * Useful for preventing excessive calculations during scrolling.
 *
 * @param callback The function to call on scroll
 * @param delay The throttle delay in milliseconds
 */
export function useScrollThrottled(callback: () => void, delay = 100): void
⋮----
/**
 * Schedules a DOM read operation to be performed in the next frame
 * to avoid layout thrashing.
 *
 * @param callback The function to call for reading DOM properties
 */
export function scheduleDOMRead(callback: () => void): void
⋮----
/**
 * Schedules a DOM write operation to be performed in the next frame
 * after all scheduled reads to avoid layout thrashing.
 *
 * @param callback The function to call for writing to the DOM
 */
export function scheduleDOMWrite(callback: () => void): void
⋮----
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
): void
⋮----
// Perform all reads first
⋮----
// Then perform all writes
⋮----
// Removed unused index 'i'
⋮----
// Missing React import
import React from 'react';
```

## File: src/lib/utils.ts
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
⋮----
/**
 * Conditionally joins class names together using clsx and merges Tailwind CSS classes using tailwind-merge.
 * @param inputs - A list of class values to merge.
 * @returns A string of merged class names.
 */
export function cn(...inputs: ClassValue[])
```

## File: src/lib/utils.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { cn } from './utils';
⋮----
// Identical classes should be merged, with the latter taking precedence
⋮----
// Different variants of the same property
⋮----
// Classes with the same property should be merged
⋮----
// Different but conflicting properties
⋮----
// Classes from different sources with conflicts
⋮----
// Simple combination
⋮----
// With conditional - enabled, primary
⋮----
// With conditional - disabled, secondary
⋮----
// Empty call
⋮----
// Only falsy values
⋮----
// Mix of empty strings and values
⋮----
// Array argument (supported by clsx)
⋮----
// Object syntax (supported by clsx)
```
