/**
 * NOVAMIND Unified Test Utilities
 * 
 * Provides quantum-level test utilities for psychiatric digital twin components
 */

import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
// Import DataContext directly since it's a simple context
import DataContext from '../application/contexts/DataContext';

// Default mock data context for tests
const mockDataContextValue = {
  patientData: null,
  brainModels: [],
  isLoadingPatient: false,
  isLoadingModels: false,
  patientError: null,
  modelsError: null,
  refreshPatientData: vi.fn(),
  refreshBrainModels: vi.fn(),
};

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
        staleTime: Infinity, // Prevent automatic refetching
      },
    },
  });
}

/**
 * Mock implementation of ThemeProvider for tests
 */
const MockThemeProvider: React.FC<{ children: ReactNode; defaultTheme?: string }> = ({ 
  children, 
  defaultTheme = 'dark' 
}) => {
  return <div data-testid="mock-theme-provider" data-theme={defaultTheme}>{children}</div>;
};

/**
 * Mock implementation of UserProvider for tests
 */
const MockUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div data-testid="mock-user-provider">{children}</div>;
};

/**
 * Mock implementation of VisualizationProvider for tests
 */
const MockVisualizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div data-testid="mock-visualization-provider">{children}</div>;
};

/**
 * AllTheProviders wraps the component under test with all necessary providers
 */
interface AllTheProvidersProps {
  children: ReactNode;
  initialRoute?: string;
  queryClient?: QueryClient;
  mockDataContext?: typeof mockDataContextValue;
}

const AllTheProviders = ({
  children,
  initialRoute = '/',
  queryClient = createTestQueryClient(),
  mockDataContext = mockDataContextValue,
}: AllTheProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MockThemeProvider defaultTheme="dark">
        <MockUserProvider>
          <MockVisualizationProvider>
            <DataContext.Provider value={mockDataContext}>
              <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
            </DataContext.Provider>
          </MockVisualizationProvider>
        </MockUserProvider>
      </MockThemeProvider>
    </QueryClientProvider>
  );
};

/**
 * Custom render function that wraps the component under test with all necessary providers,
 * allowing custom configuration per test.
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
  mockDataContext?: typeof mockDataContextValue;
}

/**
 * Custom render function that wraps the component under test with all necessary providers,
 * allowing custom configuration per test.
 */
export const renderWithProviders = (ui: ReactElement, options: ExtendedRenderOptions = {}) => {
  const { initialRoute, queryClient, mockDataContext, ...renderOptions } = options;
  
  const WrapperComponent = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders
      initialRoute={initialRoute}
      queryClient={queryClient}
      mockDataContext={mockDataContext}
    >
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: WrapperComponent, ...renderOptions });
};

// Re-export testing-library utilities for convenience
export * from '@testing-library/react';

// Export other test utilities
export { createTestQueryClient, mockDataContextValue };