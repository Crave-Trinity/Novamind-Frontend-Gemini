/**
 * Jest-DOM Setup for Novamind Frontend
 * 
 * This is the FIRST setup file that should be loaded. It handles
 * the extension of Vitest's expect with Jest DOM matchers.
 * 
 * IMPORTANT: This file must be loaded BEFORE any other setup files
 * to ensure matchers are available throughout the test environment.
 */
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Jest DOM matchers
expect.extend(matchers);

// Augment TypeScript typings for Vitest
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {
    // Phantom property to satisfy TS no-empty-interface rule
    _brand: 'vitest-assertion';
  }
  // Add mockReturnValue and mockImplementation types
  interface Mock {
    mockReturnValue<T>(val: T): Mock;
    mockImplementation<T, Y extends unknown[]>(fn: (...args: Y) => T): Mock;
  }
}

// Log to verify this file is being loaded
console.log('[JEST-DOM SETUP] Vitest extended with Jest DOM matchers');