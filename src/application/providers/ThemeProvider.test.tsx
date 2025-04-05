/**
 * ThemeProvider - Minimal Test
 * Correctly sets up mocks to prevent context imports that could hang
 */

import React from 'react';
import { screen } from '@testing-library/react'; // Remove render
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Setup proper mocks for ThemeContext
vi.mock('@application/contexts/ThemeContext', () => {
  const mockContext = {
    Provider: ({ children, value }: any) => <div data-testid="theme-context">{children}</div>,
    Consumer: ({ children }: any) => children({ theme: 'light', isDarkMode: false }),
  };

  return {
    ThemeContext: mockContext,
    ThemeMode: {
      LIGHT: 'light',
      DARK: 'dark',
    }
  };
});

// Setup proper window.matchMedia mock based on Stack Overflow recommendations
beforeEach(() => {
  // Mock matchMedia - properly structured according to MDN
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false, // Default to light mode
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock the AuditLogService
vi.mock('@infrastructure/services/AuditLogService', () => {
  return {
    auditLogService: {
      log: vi.fn()
    },
    AuditEventType: {
      SYSTEM_CONFIG_CHANGE: 'SYSTEM_CONFIG_CHANGE'
    }
  };
});

// Import the mocked service
import { auditLogService, AuditEventType } from '@infrastructure/services/AuditLogService';

// After mocking dependencies, import ThemeProvider
import { ThemeProvider } from './ThemeProvider';

// Mock browser APIs
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="mock-canvas">{children}</div>,
}));

// Mock localStorage for testing
beforeEach(() => {
  // Reset mocks between tests
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  
  // Reset document classList spy
  document.documentElement.classList.add = vi.fn();
  document.documentElement.classList.remove = vi.fn();
});

// Import test utilities
// Import the unified render function
import { renderWithProviders } from '@test/test-utils.unified';

// Minimal test to verify component can be imported
describe('ThemeProvider (Minimal)', () => {
  it('exists as a module', () => {
    expect(ThemeProvider).toBeDefined();
  });
  
  it('renders children without crashing', () => {
    renderWithProviders( // Use unified render
      <ThemeProvider>
        <div data-testid="test-child">Test Child</div>
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('accepts a defaultTheme prop', () => {
    renderWithProviders( // Use unified render
      <ThemeProvider defaultTheme="dark">
        <div data-testid="test-child">Test Child</div>
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('calls auditLogService when rendered', () => {
    const mockAuditLog = vi.mocked(auditLogService.log);
    renderWithProviders( // Use unified render
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );
    
    expect(mockAuditLog).toHaveBeenCalledWith(
      'SYSTEM_CONFIG_CHANGE',
      expect.objectContaining({
        action: 'THEME_CHANGE',
        result: 'success'
      })
    );
  });
  
  it('detects dark mode from system preference', () => {
    // Override matchMedia mock to simulate dark mode preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('prefers-color-scheme: dark'),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    renderWithProviders( // Use unified render
      <ThemeProvider defaultTheme="system">
        <div data-testid="dark-mode-test">Dark Mode Test</div>
      </ThemeProvider>
    );
    
    // Verify dark mode is applied to the document
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    
    // Verify the audit log service is called
    expect(auditLogService.log).toHaveBeenCalledWith(
      AuditEventType.SYSTEM_CONFIG_CHANGE,
      expect.objectContaining({
        action: 'THEME_CHANGE',
        result: 'success'
      })
    );
  });
});
