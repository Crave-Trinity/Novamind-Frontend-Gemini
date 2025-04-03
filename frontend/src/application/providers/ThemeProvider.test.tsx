/**
 * ThemeProvider - Minimal Test
 * Correctly sets up mocks to prevent context imports that could hang
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must mock ThemeContext before importing ThemeProvider
vi.mock('@contexts/ThemeContext', () => {
  // Create mock context
  const mockContext = {
    Provider: ({ children }: any) => <div>{children}</div>,
    Consumer: ({ children }: any) => children({ theme: 'clinical', isDarkMode: false }),
  };

  // Mock theme settings
  const themeSettings = {
    clinical: { primary: '#123456' },
    dark: { primary: '#654321' },
    sleek: { primary: '#abcdef' },
    light: { primary: '#fedcba' }
  };

  return {
    default: mockContext,
    themeSettings,
    ThemeContextType: {},
    ThemeOption: {}
  };
});

// After mocking ThemeContext, import ThemeProvider
import ThemeProvider from './ThemeProvider';

// Mock browser APIs
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="mock-canvas">{children}</div>,
}));

// Add any other mocks needed
vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn()
});

vi.stubGlobal('matchMedia', () => ({
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}));

// Minimal test to verify component can be imported
describe('ThemeProvider (Minimal)', () => {
  it('exists as a module', () => {
    expect(ThemeProvider).toBeDefined();
  });
  
  it('renders children without crashing', () => {
    render(
      <ThemeProvider>
        <div data-testid="test-child">Test Child</div>
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});
