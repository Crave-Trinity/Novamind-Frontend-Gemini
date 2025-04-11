/**
 * Unified Test Utilities
 *
 * Provides testing utilities including enhanced render functions with theme support.
 * This is the canonical location for all test utility functions.
 */
import type { ReactElement } from 'react';
import React from 'react';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../application/providers/ThemeProvider';
import type { ThemeMode } from '../application/contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import { tailwindHelper } from './setup.unified';
import { vi } from 'vitest';

// --- Robust window.matchMedia Mock (Specific to renderWithProviders) ---
// This mock is defined here to ensure tests using renderWithProviders
// get the instance with the _triggerChange helper.
let darkSchemeListeners: ((event: Event) => void)[] = [];
// Export the mock list and its trigger for external use (e.g., in setup.unified.ts)
export const darkSchemeMediaQueryList = {
  matches: false, // Default to light
  media: '(prefers-color-scheme: dark)',
  onchange: null,
  addListener: vi.fn((cb) => {
    // Deprecated
    if (!darkSchemeListeners.includes(cb)) darkSchemeListeners.push(cb);
  }),
  removeListener: vi.fn((cb) => {
    // Deprecated
    darkSchemeListeners = darkSchemeListeners.filter((l) => l !== cb);
  }),
  addEventListener: vi.fn((event, cb) => {
    if (event === 'change' && cb && !darkSchemeListeners.includes(cb)) darkSchemeListeners.push(cb);
  }),
  removeEventListener: vi.fn((event, cb) => {
    if (event === 'change') darkSchemeListeners = darkSchemeListeners.filter((l) => l !== cb);
  }),
  dispatchEvent: vi.fn((event: Event) => {
    if (event.type === 'change') darkSchemeListeners.forEach((l) => l(event));
    return true;
  }),
  // Helper for tests to simulate system change
  _triggerChange: (matches: boolean) => {
    darkSchemeMediaQueryList.matches = matches;
    darkSchemeMediaQueryList.dispatchEvent(new Event('change'));
  },
};

// Store the original matchMedia to restore it later if needed (though setup.ts handles global)
// Removed unused variable 'originalMatchMedia'

// Define the mock implementation function separately
// Export the implementation function if needed elsewhere, though likely not
export const matchMediaMockImplementation = (query: string) => {
  if (query === '(prefers-color-scheme: dark)') {
    // Reset listeners and matches state for each call to window.matchMedia
    // This ensures tests get a fresh state when they query, but the underlying object persists
    darkSchemeListeners = [];
    darkSchemeMediaQueryList.matches = false; // Default to light unless overridden
    // Allow tests to override initial matches via setup (less common now)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((globalThis as any).__vitest_matchMedia_matches !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      darkSchemeMediaQueryList.matches = (globalThis as any).__vitest_matchMedia_matches;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).__vitest_matchMedia_matches;
    }
    return darkSchemeMediaQueryList; // Return the persistent instance
  }
  // Return a generic, non-functional mock for other queries
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
};

// Apply the mock before tests using renderWithProviders run
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation(matchMediaMockImplementation),
});
// --- End matchMedia Mock ---

// Create a query client instance for tests with specific settings
const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
});

// Common provider wrappers for tests
interface TestProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

/**
 * All-in-one providers wrapper for testing
 */
export const AllProviders: React.FC<TestProviderProps> = ({
  children,
  defaultTheme = 'clinical',
}) => {
  // ThemeProvider handles class application based on defaultTheme prop.

  return (
    <BrowserRouter>
      <QueryClientProvider client={testQueryClient}>
        <ThemeProvider defaultTheme={defaultTheme}>{children}</ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Extended render options with theme support
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  defaultTheme?: ThemeMode;
  darkMode?: boolean; // Kept for potential direct DOM manipulation if needed, but generally rely on ThemeProvider
}

/**
 * Custom render function with all providers
 * Returns standard render result plus dark mode helpers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    defaultTheme = 'clinical',
    darkMode = false, // This darkMode prop might be less useful now ThemeProvider handles classes
    ...options
  }: ExtendedRenderOptions = {}
) {
  // Apply the robust mock specifically when this function is called
  // This ensures it overrides the global mock from setup.ts only for these tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation(matchMediaMockImplementation),
  });

  // Reset the mock state before each render using this utility
  darkSchemeListeners = [];
  darkSchemeMediaQueryList.matches = darkMode; // Set initial state based on darkMode prop if provided
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).__vitest_matchMedia_matches; // Clear any global override

  // Apply dark mode class directly if darkMode prop is true (might conflict with ThemeProvider, use with caution)
  // Consider removing this if ThemeProvider handles it reliably based on defaultTheme
  // if (darkMode) {
  //   tailwindHelper.enableDarkMode();
  // } else {
  //   tailwindHelper.disableDarkMode();
  // }

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllProviders defaultTheme={defaultTheme}>{children}</AllProviders>
  );

  const renderResult = render(ui, { wrapper: Wrapper, ...options });

  // Return additional utilities, including the trigger function
  return {
    ...renderResult,
    isDarkMode: () => darkSchemeMediaQueryList.matches, // Read from the mock instance
    triggerSystemThemeChange: (matches: boolean) =>
      darkSchemeMediaQueryList._triggerChange(matches), // Expose the trigger
    // Deprecating direct tailwind helpers from return if ThemeProvider is reliable - RE-ENABLED FOR NOW TO FIX TESTS
    enableDarkMode: tailwindHelper.enableDarkMode,
    disableDarkMode: tailwindHelper.disableDarkMode,
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with our version
export { renderWithProviders as render };
