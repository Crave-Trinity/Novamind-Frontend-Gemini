/**
 * Unified Test Utilities
 * 
 * Provides testing utilities including enhanced render functions with theme support.
 * This is the canonical location for all test utility functions.
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import ThemeProvider from '../application/providers/ThemeProvider';
import { ThemeOption } from '../application/contexts/ThemeContext';
import { tailwindHelper } from './setup.unified';

// Common provider wrappers for tests
interface TestProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeOption;
}

/**
 * All-in-one providers wrapper for testing
 */
export const AllProviders: React.FC<TestProviderProps> = ({
  children,
  initialTheme = 'clinical',
}) => {
  // Set up dark/light mode on document level
  if (initialTheme === 'dark' || initialTheme === 'sleek') {
    tailwindHelper.enableDarkMode();
  } else {
    tailwindHelper.disableDarkMode();
  }

  return (
    <ThemeProvider initialTheme={initialTheme}>
      {children}
    </ThemeProvider>
  );
};

// Extended render options with theme support
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialTheme?: ThemeOption;
  darkMode?: boolean;
}

/**
 * Custom render function with all providers
 * Returns standard render result plus dark mode helpers
 */
export function renderWithProviders(
  ui: ReactElement,
  { 
    initialTheme = 'clinical',
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
    <AllProviders initialTheme={initialTheme}>
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