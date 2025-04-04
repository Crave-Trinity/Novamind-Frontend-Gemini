/**
 * Global test utilities for Novamind frontend
 * 
 * This module provides helper functions for testing components with proper
 * mocking of browser APIs and test providers.
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@application/providers/ThemeProvider';

// Mock window.matchMedia for tests
export function setupMatchMediaMock() {
  // Create mock for matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false, // Default to light mode
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
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

// Custom render for components that need providers
interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  // Setup mocks before rendering
  setupAllMocks();
  
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
