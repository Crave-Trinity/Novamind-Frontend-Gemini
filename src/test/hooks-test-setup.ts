/**
 * NOVAMIND Testing Framework
 * Specialized Hook Testing Setup
 *
 * This setup file provides a clean environment for testing React hooks,
 * particularly those using React Query, which is a common source of test hangs.
 */

import { afterEach, beforeEach, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

// Create a shared QueryClient for consistent cache clearing
let testQueryClient: QueryClient | null = null;

// Avoid using fake timers in hook tests, as they can cause hangs
// with async operations that use setTimeout
beforeEach(() => {
  // Always use real timers for hook tests
  vi.useRealTimers();

  // Create a fresh QueryClient for each test
  testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Critical for testing - disable retries
        retry: false,
        // Disable caching (React Query v5 uses gcTime instead of cacheTime)
        gcTime: 0,
        staleTime: 0,
        // Disable refetching
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Disable retries for mutations as well
        retry: false,
      },
    },
  });

  // Force React Query's cache to clear
  testQueryClient.clear();
});

afterEach(() => {
  // Clean up after each test
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();

  // Clear the query cache again
  if (testQueryClient) {
    testQueryClient.clear();
    testQueryClient = null;
  }
});

// Create a test QueryClient with consistent settings
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Export a global flag to signal this setup has been loaded
export const hooksTestSetupComplete = true;

console.log('[hooks-test-setup.ts] Specialized hook testing setup complete.');
