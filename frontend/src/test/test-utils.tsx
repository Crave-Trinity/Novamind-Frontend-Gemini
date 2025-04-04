/**
 * Test Utilities
 *
 * Enhanced rendering utilities with Tailwind and theme support.
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import ThemeProvider from '../application/providers/ThemeProvider';
import { ThemeOption } from '../application/contexts/ThemeContext';
import { tailwindMock } from './tailwind-mock';

/**
 * Custom render options with theme support
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialTheme?: ThemeOption;
  darkMode?: boolean;
}

/**
 * Create a ThemeProvider wrapper with specified options
 */
export function createThemeWrapper(initialTheme: ThemeOption = 'clinical', darkMode: boolean = false) {
  // Apply dark mode if requested
  if (darkMode) {
    tailwindMock.enableDarkMode();
  } else {
    tailwindMock.disableDarkMode();
  }

  return ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider initialTheme={initialTheme}>
      {children}
    </ThemeProvider>
  );
}

/**
 * Custom render with ThemeProvider
 * 
 * Wraps the rendered component with ThemeProvider and applies dark mode if requested
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialTheme = 'clinical', darkMode = false, ...options }: CustomRenderOptions = {}
) {
  const AllTheProviders = createThemeWrapper(initialTheme, darkMode);
  
  return {
    ...render(ui, { wrapper: AllTheProviders, ...options }),
    // Return additional utilities
    isDarkMode: () => tailwindMock.isDarkMode(),
    enableDarkMode: () => tailwindMock.enableDarkMode(),
    disableDarkMode: () => tailwindMock.disableDarkMode(),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with our custom version
export { renderWithProviders as render };
