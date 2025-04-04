/**
 * Global test utilities for Novamind frontend
 * 
 * This module provides helper functions for testing components with proper
 * mocking of browser APIs and test providers.
 */

import React, { useState, useCallback, useMemo, createContext } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the ThemeContext similar to the real application
export type ThemeMode = 'light' | 'dark' | 'system' | 'clinical' | 'sleek-dark' | 'retro' | 'wes';

interface ThemeContextType {
  mode: ThemeMode;
  theme: 'light' | 'dark';
  isDarkMode: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  theme: 'light',
  isDarkMode: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

// Mock window.matchMedia for tests
export function setupMatchMediaMock() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false, // Default to light mode
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock localStorage for tests
export function setupLocalStorageMock() {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
}

// Setup all mocks needed for tests
export function setupAllMocks() {
  setupMatchMediaMock();
  setupLocalStorageMock();
}

// Simplified theme provider for tests
interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Setup mocks
  setupAllMocks();
  
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setMode(newTheme);
    setIsDarkMode(newTheme === 'dark' || newTheme === 'sleek-dark');
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(current => {
      const newMode = current === 'light' ? 'dark' : 'light';
      setIsDarkMode(newMode === 'dark');
      return newMode;
    });
  }, []);

  const contextValue = useMemo(() => ({
    mode,
    theme: isDarkMode ? 'dark' as const : 'light' as const,
    isDarkMode,
    setTheme,
    toggleTheme
  }), [mode, isDarkMode, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom render for components that need providers
interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Export everything from testing-library for convenience
export * from '@testing-library/react';
