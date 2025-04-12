/**
 * NOVAMIND Unified Test Utilities
 */

import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ThemeProvider } from '../application/contexts/ThemeContext';
import { UserProvider } from '../application/contexts/UserContext';
import { VisualizationProvider } from '../application/contexts/VisualizationContext';
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
 * AllTheProviders wraps the component under test with all necessary providers
 */
interface AllTheProvidersProps {
  children: ReactNode;
  initialRoute?: string;
  queryClient?: QueryClient;
  mockDataContext?: typeof mockDataContextValue;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
  initialRoute = '/',
  queryClient = createTestQueryClient(),
  mockDataContext = mockDataContextValue,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <UserProvider>
          <VisualizationProvider>
            <DataContext.Provider value={mockDataContext}>
              <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
            </DataContext.Provider>
          </VisualizationProvider>
        </UserProvider>
      </ThemeProvider>
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
export const renderWithProviders = (
  ui: ReactElement,
  {
    initialRoute,
    queryClient,
    mockDataContext,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  // Dynamically create the wrapper component for this render call,
  // passing down the specified options or allowing AllTheProviders defaults.
  const WrapperComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders
      initialRoute={initialRoute} // Pass route from options, defaults in AllTheProviders if undefined
      queryClient={queryClient}   // Pass client from options, defaults in AllTheProviders if undefined
      mockDataContext={mockDataContext} // Pass data context from options, defaults in AllTheProviders if undefined
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