/**
 * Core Test Utilities for Novamind Frontend
 * 
 * This file provides standardized testing utilities for React components,
 * including a custom render function with all necessary providers.
 * It is the SINGLE SOURCE OF TRUTH for component testing utilities.
 */
import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Import relevant contexts
// Note: Import paths may need adjustment based on actual project structure
import { ThemeProvider } from '../application/providers/ThemeProvider';
import type { ThemeMode } from '../application/contexts/ThemeContext';
import UserContext from '../application/contexts/UserContext';
import VisualizationContext from '../application/contexts/VisualizationContext';
import DataContext from '../application/contexts/DataContext';

// Default mock data
const defaultMockData = {
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
        retry: false,
        staleTime: Infinity,
        gcTime: 0, // cacheTime is renamed to gcTime in newer versions
      },
    },
  });
}

// Mock authentication context
const mockAuthContext = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'clinician',
    organization: 'Test Hospital',
    preferences: {
      theme: 'clinical',
      visualizationDefaults: {
        detailLevel: 'medium',
        colorScheme: 'clinical',
        annotationsVisible: true,
        timeScale: 1.0,
      },
      dashboardLayout: 'detailed',
    },
    lastLogin: new Date().toISOString(),
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
  updatePreferences: vi.fn(),
  resetPreferences: vi.fn(),
};

// Mock visualization context
const mockVisualizationContext = {
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
    showClinicalMarkers: true,
  },
  updateSettings: vi.fn(),
  resetSettings: vi.fn(),
  isLoading: false,
  setIsLoading: vi.fn(),
  activeRegions: new Map(),
  setActiveRegion: vi.fn(),
  clearActiveRegions: vi.fn(),
  captureSnapshot: vi.fn().mockResolvedValue('data:image/png;base64,test'),
};

// All-in-one provider wrapper
interface AllProvidersProps {
  children: ReactNode;
  initialRoute?: string;
  theme?: ThemeMode;
  queryClient?: QueryClient;
  mockData?: typeof defaultMockData;
}

export const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  initialRoute = '/',
  theme = 'light',
  queryClient = createTestQueryClient(),
  mockData = defaultMockData,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={theme as any}>
        <UserContext.Provider value={mockAuthContext as any}>
          <VisualizationContext.Provider value={mockVisualizationContext as any}>
            <DataContext.Provider value={mockData as any}>
              <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
            </DataContext.Provider>
          </VisualizationContext.Provider>
        </UserContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Extended render options
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  theme?: ThemeMode;
  queryClient?: QueryClient;
  mockData?: typeof defaultMockData;
}

/**
 * Custom render function that wraps components with all necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    initialRoute,
    theme,
    queryClient,
    mockData,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  // Apply theme to document if provided
  if (theme && typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark', 'system', 'clinical');
    document.documentElement.classList.add(theme as string);
  }

  // Create wrapper with all providers
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders
      initialRoute={initialRoute}
      theme={theme}
      queryClient={queryClient}
      mockData={mockData}
    >
      {children}
    </AllProviders>
  );

  // Render with extended utilities
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    
    // Additional helper functions
    setTheme: (newTheme: ThemeMode) => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark', 'system', 'clinical');
        document.documentElement.classList.add(newTheme as string);
      }
    },
    
    // MockQueryClient for making assertions/manipulations
    queryClient: queryClient || createTestQueryClient(),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the default render method
export { renderWithProviders as render };