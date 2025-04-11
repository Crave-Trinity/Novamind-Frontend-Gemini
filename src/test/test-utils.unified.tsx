/**
 * NOVAMIND Neural Digital Twin
 * Unified Test Utilities
 * 
 * This module provides quantum-level test utilities that support
 * all testing scenarios with architectural perfection.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@application/providers/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a pristine QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Interface for extended render options
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialTheme?: 'light' | 'dark' | 'system' | 'clinical' | 'retro';
  queryClient?: QueryClient;
}

/**
 * Renders a component with all providers needed for testing
 * 
 * This is the quantum-level render function that guarantees
 * all components have the proper context providers for testing.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    initialTheme = 'clinical',
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  // Update history and set proper route
  window.history.pushState({}, 'Test page', route);

  // Provider wrapper with proper nesting order
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider defaultTheme={initialTheme}>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  // Return enhanced render result with additional helper methods
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    // Additional helper methods:
    // Rerender with same providers
    rerender: (rerenderUi: ReactElement) => 
      render(rerenderUi, { wrapper: Wrapper, ...renderOptions }),
    // Get the queryClient for direct manipulation
    queryClient,
  };
}

// Export everything from test libraries
export * from '@testing-library/react';