/**
 * Unified Test Utilities
 *
 * Provides testing utilities including enhanced render functions with theme support.
 * This is the canonical location for all test utility functions.
 */
import type { ReactElement } from 'react';
import React from 'react';
// Removed vi import as mock is removed
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
// Ensure QueryClient and Provider are imported only once
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../application/providers/ThemeProvider';
import type { ThemeMode } from '../application/contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { tailwindHelper } from './setup.unified';
import { vi } from 'vitest'; // Import vi

// Mock window.matchMedia directly here for reliability
// More robust matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => {
    let listeners: ((event: Event) => void)[] = [];
    const instance = {
      matches: false, // Default to light
      media: query,
      onchange: null,
      addListener: vi.fn((cb) => {
        if (!listeners.includes(cb)) listeners.push(cb);
      }), // Deprecated
      removeListener: vi.fn((cb) => {
        listeners = listeners.filter((l) => l !== cb);
      }), // Deprecated
      addEventListener: vi.fn((_, cb) => {
        if (!listeners.includes(cb)) listeners.push(cb);
      }),
      removeEventListener: vi.fn((_, cb) => {
        listeners = listeners.filter((l) => l !== cb);
      }),
      dispatchEvent: vi.fn((event: Event) => {
        listeners.forEach((l) => l(event));
        return true;
      }),
      _triggerChange: (matches: boolean) => {
        // Helper for tests
        instance.matches = matches;
        instance.dispatchEvent(new Event('change'));
      },
    };
    // Allow tests to override initial matches via setup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((globalThis as any).__vitest_matchMedia_matches) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      instance.matches = (globalThis as any).__vitest_matchMedia_matches;
    }
    return instance;
  }),
});

// Removed ThemeProvider mock to address root cause

// Create a query client instance for tests with specific settings
const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity, // Keep data indefinitely (align with canonical doc)
      staleTime: Infinity, // Data never stale automatically (align with canonical doc)
      refetchOnWindowFocus: false,
    },
  },
  // logger option removed as it's not valid in this version/context
});

// Common provider wrappers for tests
interface TestProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode; // Use correct prop name and type
}

/**
 * All-in-one providers wrapper for testing
 */
export const AllProviders: React.FC<TestProviderProps> = ({
  children,
  defaultTheme = 'clinical', // Use correct prop name
}) => {
  // Set up dark/light mode on document level
  // Use defaultTheme for logic
  if (defaultTheme === 'dark' || defaultTheme === 'sleek-dark') {
    tailwindHelper.enableDarkMode();
  } else {
    tailwindHelper.disableDarkMode();
  }

  return (
    // Wrap with BrowserRouter > QueryClientProvider > ThemeProvider
    <BrowserRouter>
      <QueryClientProvider client={testQueryClient}>
        <ThemeProvider defaultTheme={defaultTheme}>{children}</ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Extended render options with theme support
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  defaultTheme?: ThemeMode; // Use correct prop name and type
  darkMode?: boolean;
}

/**
 * Custom render function with all providers
 * Returns standard render result plus dark mode helpers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    defaultTheme = 'clinical', // Use correct prop name
    darkMode = false,
    ...options
  }: ExtendedRenderOptions = {}
) {
  // Apply dark mode if requested
  if (darkMode) {
    tailwindHelper.enableDarkMode();
  } else {
    tailwindHelper.disableDarkMode();
  }

  // Create wrapper with correct initial values
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllProviders defaultTheme={defaultTheme}>{children}</AllProviders>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    // Return additional utilities for tests
    isDarkMode: tailwindHelper.isDarkMode,
    enableDarkMode: tailwindHelper.enableDarkMode,
    disableDarkMode: tailwindHelper.disableDarkMode,
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with our version
export { renderWithProviders as render };
