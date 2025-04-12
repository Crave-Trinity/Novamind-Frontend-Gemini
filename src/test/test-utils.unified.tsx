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
 * Custom render function that wraps the component under test with all necessary providers
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
  mockDataContext?: typeof mockDataContextValue;
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    // Prefix unused variables as per lint rule
    initialRoute: _initialRoute,
    queryClient: _queryClient,
    mockDataContext: _mockDataContext,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  // Note: The wrapper itself now uses the default values from AllTheProviders
  // if specific ones aren't passed to renderWithProviders.
  return render(ui, { wrapper: AllTheProviders as React.ComponentType, ...renderOptions });
};

// Export everything from testing-library for convenience
export * from '@testing-library/react';
// renderWithProviders is already exported above
export { createTestQueryClient, mockDataContextValue };