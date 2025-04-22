/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite
 * MainLayout testing with quantum precision
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'; // Import hooks
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // render is imported from unified utils
import React from 'react';
import userEvent from '@testing-library/user-event';
import MainLayout from './MainLayout'; // Assuming default export
import { render as baseRender } from '../../test/test-utils.unified';
import { MemoryRouter } from 'react-router-dom';

// Mock the useTheme hook directly
vi.mock('@application/hooks/useTheme', () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleTheme: vi.fn(),
    mode: 'light',
    theme: 'clinical',
    setTheme: vi.fn(),
    isDark: false,
    colors: {
      primary: '#0062cc',
      secondary: '#3a86ff',
      accent: '#f72585',
      text: {
        primary: '#202124',
        secondary: '#5f6368',
        muted: '#80868b',
      },
      background: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
      },
      neural: {
        active: '#ff5e5b',
        inactive: '#373737',
      },
    },
    fontSize: 16,
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      full: '9999px',
    },
  }),
}));

// Custom render function with Router wrapper
const render = (ui: React.ReactElement, options = {}) => {
  return baseRender(<MemoryRouter initialEntries={['/dashboard']}>{ui}</MemoryRouter>, options);
};

// Mock data with clinical precision
// Mock data with clinical precision - MainLayout requires children
const mockProps = {
  children: React.createElement('div', null, 'Test Child Content'),
};

describe('MainLayout', () => {
  // Re-enabled suite
  // Store original matchMedia
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia; // Store original

    // Mock matchMedia specifically for this test suite
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true, // Ensure it can be restored
      value: vi.fn().mockImplementation((query) => {
        console.log(`[TEST] matchMedia called with query: ${query}`); // Diagnostic log
        const isLightQuery = query === '(prefers-color-scheme: light)';
        const isDarkQuery = query === '(prefers-color-scheme: dark)';
        // Default to light theme unless dark is explicitly queried, ensure boolean
        const matches = isLightQuery || !isDarkQuery;
        return {
          matches: matches,
          media: query,
          onchange: null,
          addListener: vi.fn(), // Deprecated but mock
          removeListener: vi.fn(), // Deprecated but mock
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }),
    });
    // Clear mocks AFTER setting up matchMedia mock if needed,
    // but generally clear before setting up mocks for the test run.
    // Let's clear before setting up specific mocks for this test.
    vi.clearAllMocks(); // Clear previous test mocks first

    // Re-apply the mock after clearing (or ensure clear doesn't remove it)
    // The above Object.defineProperty should suffice as it runs each time.
  });

  afterEach(() => {
    // Restore original matchMedia to avoid side-effects between test files
    Object.defineProperty(window, 'matchMedia', {
      value: originalMatchMedia,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks(); // Restore any other mocks
  });

  // Optional: Restore if needed, though less critical if beforeEach redefines
  // afterEach(() => {
  //   vi.restoreAllMocks();
  // });

  it('renders with neural precision', () => {
    render(<MainLayout {...mockProps} />); // Use our custom render with MemoryRouter

    // Add assertions for rendered content
    // Check if the child content is rendered
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
    // Check for the Novamind logo text in the sidebar
    const logoText = screen.getAllByText(/Novamind/i)[0];
    expect(logoText).toBeInTheDocument();
    // Verify main layout container exists
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('responds to user interaction with quantum precision', async () => {
    const user = userEvent.setup();
    render(<MainLayout {...mockProps} />);

    // Find the theme toggle button using its data-testid
    const themeToggleButton = screen.getByTestId('theme-toggle-button');
    expect(themeToggleButton).toBeInTheDocument();

    // Click the button
    await user.click(themeToggleButton);

    // Since we've mocked toggleTheme, we just verify the interaction occurred
  });

  // Add more component-specific tests
});
