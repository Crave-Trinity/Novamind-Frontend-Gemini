/**
 * Unified Test Utilities
 * 
 * Provides testing utilities including enhanced render functions with theme support.
 * This is the canonical location for all test utility functions.
 */
import React, { ReactElement } from 'react';
// Removed vi import as mock is removed
import { render, RenderOptions } from '@testing-library/react';
// Ensure QueryClient and Provider are imported only once
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../application/providers/ThemeProvider';
import { ThemeMode } from '../application/contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { tailwindHelper } from './setup.unified';
import { vi } from 'vitest'; // Import vi

// Mock window.matchMedia directly here for reliability
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('dark'), // Default mock behavior
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
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
  }
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
        <ThemeProvider defaultTheme={defaultTheme}>
          {children}
        </ThemeProvider>
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
    <AllProviders defaultTheme={defaultTheme}>
      {children}
    </AllProviders>
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