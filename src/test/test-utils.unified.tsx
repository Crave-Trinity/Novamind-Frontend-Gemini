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
interface MockThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
}

const MockThemeProvider: React.FC<MockThemeProviderProps> = ({ 
  children,
  defaultTheme = 'dark',
  onThemeChange
}) => {
  // Use state to track the current theme
  const [theme, setThemeState] = React.useState<'light' | 'dark' | 'system'>(defaultTheme as 'light' | 'dark' | 'system');

  // Apply theme to document element just like the real ThemeProvider would
  React.useEffect(() => {
    const applyThemeToDocument = (themeName: string) => {
      // Remove all theme classes
      document.documentElement.classList.remove('light', 'dark', 'system');
      // Add the new theme class
      document.documentElement.classList.add(themeName);
      console.log(`[ThemeProvider] applyTheme called with: ${themeName}`);
    };
    
    applyThemeToDocument(theme);
  }, [theme]);

  // Initialize with default theme
  React.useEffect(() => {
    setThemeState(defaultTheme);
  }, [defaultTheme]);

  // Enhanced setTheme function that actually updates the document and state
  const setTheme = React.useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    // Notify parent component if onThemeChange is provided
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
    console.log(`[MockThemeProvider] Theme changed to: ${newTheme}`);
  }, [onThemeChange]);

  // Calculate derived values based on current theme
  const isDark = theme === 'dark';
  const mode = isDark ? 'dark' : 'light';

  // Create a mock theme context with all properties required by the ThemeContextType interface
  const themeContextValue = {
    theme,
    setTheme,
    isDark,
    mode, // This will be cast to ThemeMode enum value
    isDarkMode: isDark,
    toggleTheme: vi.fn(() => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    }),
    colors: {
      primary: '#0062cc',
      secondary: '#3a86ff',
      accent: '#f72585',
      text: {
        primary: '#202124',
        secondary: '#5f6368',
        muted: '#80868b'
      },
      background: {
        primary: defaultTheme === 'dark' ? '#121212' : '#ffffff',
        secondary: defaultTheme === 'dark' ? '#1e1e1e' : '#f8f9fa'
      },
      neural: {
        active: '#ff5e5b',
        inactive: '#373737'
      }
    },
    fontSize: 16,
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      full: '9999px'
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <ThemeContext.Provider value={themeContextValue as any}>
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
      role: 'clinician', // This will be cast to UserRole
      organization: 'Test Hospital',
      preferences: {
        theme: 'clinical',
        visualizationDefaults: { 
          detailLevel: 'medium', 
          colorScheme: 'clinical', 
          annotationsVisible: true, 
          timeScale: 1.0,
        },
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
    <UserContext.Provider value={userContextValue as any}>
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
      renderMode: 'standard', // This will be cast to RenderMode enum
      detailLevel: 'medium',  // This will be cast to DetailLevel enum
      showConnections: true,
      connectionThreshold: 0.3,
      activationThreshold: 0.2,
      sliceView: false,
      highlightRegions: [],
      timeScale: 1.0,
      colorMapping: 'clinical', // This will be cast to ColorMapping enum
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
    <VisualizationContext.Provider value={visualizationContextValue as any}>
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
  currentTheme?: 'light' | 'dark' | 'system';
  setCurrentTheme?: React.Dispatch<React.SetStateAction<'light' | 'dark' | 'system'>>;
}

const AllTheProviders = ({
  children,
  initialRoute = '/',
  queryClient = createTestQueryClient(),
  mockDataContext = mockDataContextValue,
  currentTheme = 'dark',
  setCurrentTheme,
}: AllTheProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MockThemeProvider 
        defaultTheme={currentTheme}
        onThemeChange={setCurrentTheme ? (newTheme) => setCurrentTheme(newTheme) : undefined}
      >
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
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
  mockDataContext?: typeof mockDataContextValue;
  defaultTheme?: 'light' | 'dark' | 'system';
}

/**
 * Custom render function that wraps the component under test with all necessary providers,
 * and returns enhanced functions for theme testing.
 */
export const renderWithProviders = (ui: ReactElement, options: ExtendedRenderOptions = {}) => {
  const { initialRoute, queryClient, mockDataContext, defaultTheme, ...renderOptions } = options;
  
  // Create a stateful wrapper that can track theme changes
  const WrapperComponent = ({ children }: { children: React.ReactNode }) => {
    // Get default theme from localStorage if available, otherwise use provided default or system
    const getInitialTheme = (): 'light' | 'dark' | 'system' => {
      // First check localStorage
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
        return storedTheme;
      }
      // Then use provided default or fallback to light (clinical UI default)
      return (defaultTheme as 'light' | 'dark' | 'system') || 'light';
    };
    
    // Initialize with appropriate theme
    const [currentTheme, setCurrentTheme] = React.useState<'light' | 'dark' | 'system'>(getInitialTheme());
    
    // Apply theme class to document
    React.useEffect(() => {
      document.documentElement.classList.remove('light', 'dark', 'system');
      document.documentElement.classList.add(currentTheme);
    }, [currentTheme]);
    
    // Sync with localStorage
    React.useEffect(() => {
      localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);
    
    return (
      <AllTheProviders
        initialRoute={initialRoute}
        queryClient={queryClient}
        mockDataContext={mockDataContext}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
      >
        {children}
      </AllTheProviders>
    );
  }; // End of WrapperComponent definition

  // --- Start of code block to move ---
  // Only set light mode as default if there's no localStorage theme already set
  // Use optional chaining and nullish coalescing to safely access window properties
  const storedTheme = typeof window !== 'undefined' && window.localStorage
    ? window.localStorage.getItem('theme')
    : null;
    
  if (!storedTheme) {
    // Safely access localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('theme');
    }
    
    // Safely access document
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.remove('dark', 'system');
      document.documentElement.classList.add('light');
    }
  }
  // --- End of code block to move ---

  // Render with our wrapper
  // Render with our wrapper
  const result = render(ui, { wrapper: WrapperComponent, ...renderOptions });
  
  // Helper function to check dark mode
  const isDarkMode = () => document.documentElement.classList.contains('dark');
  
  // Return the standard render result plus our custom helpers
  return {
    ...result,
    isDarkMode,
    enableDarkMode: () => {
      document.documentElement.classList.remove('light', 'system');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    },
    disableDarkMode: () => {
      document.documentElement.classList.remove('dark', 'system');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    },
  };
}; // <-- Add missing closing brace for renderWithProviders

// Re-export testing-library utilities for convenience
export * from '@testing-library/react';

// Export other test utilities
export { createTestQueryClient, mockDataContextValue };