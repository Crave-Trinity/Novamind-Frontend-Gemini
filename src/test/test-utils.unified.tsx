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

// Import the relevant contexts and types
import DataContext from '../application/contexts/DataContext';
import { ThemeContext } from '../application/contexts/ThemeContext';
import UserContext from '../application/contexts/UserContext';
import VisualizationContext from '../application/contexts/VisualizationContext';

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
  // Create a simple mock theme context with minimal values needed for components
  const themeContextValue = {
    theme: defaultTheme,
    setTheme: vi.fn(),
    isDark: defaultTheme === 'dark',
    colors: {
      primary: '#0062cc',
      text: {
        primary: '#202124'
      },
      neural: {
        active: '#ff5e5b',
        inactive: '#373737'
      }
    },
    fontSize: 16
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <div data-testid="mock-theme-provider" data-theme={defaultTheme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

/**
 * Mock implementation of UserProvider for tests
 */
const MockUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Create a basic mock user context with minimal values needed for tests
  const userContextValue = {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'clinician',
      organization: 'Test Hospital',
      preferences: {
        theme: 'clinical',
        visualizationDefaults: { detailLevel: 'medium', colorScheme: 'clinical', annotationsVisible: true, timeScale: 1.0 },
        dashboardLayout: 'detailed'
      },
      lastLogin: new Date().toISOString()
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    updatePreferences: vi.fn(),
    resetPreferences: vi.fn()
  };

  return (
    <UserContext.Provider value={userContextValue}>
      <div data-testid="mock-user-provider">{children}</div>
    </UserContext.Provider>
  );
};

/**
 * Mock implementation of VisualizationProvider for tests
 */
const MockVisualizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Minimal mock visualization context values needed for tests
  const visualizationContextValue = {
    settings: {
      renderMode: 'standard',
      detailLevel: 'medium',
      showConnections: true,
      connectionThreshold: 0.3,
      activationThreshold: 0.2,
      sliceView: false,
      highlightRegions: [],
      timeScale: 1.0,
      colorMapping: 'clinical',
      transparencyLevel: 0.1,
      annotationsVisible: true,
      showClinicalMarkers: true
    },
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
    isLoading: false,
    setIsLoading: vi.fn(),
    activeRegions: new Map(),
    setActiveRegion: vi.fn(),
    clearActiveRegions: vi.fn(),
    captureSnapshot: vi.fn().mockResolvedValue('data:image/png;base64,test')
  };

  return (
    <VisualizationContext.Provider value={visualizationContextValue}>
      <div data-testid="mock-visualization-provider">{children}</div>
    </VisualizationContext.Provider>
  );
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