import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider';

// Test component that uses the theme
function TestComponent() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  const mockGetItem = vi.fn();
  const mockSetItem = vi.fn();
  const mockMatchMedia = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove('light', 'dark');

    // Setup localStorage mock for each test
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
        clear: vi.fn(() => { // Add clear method to local mock
          mockGetItem.mockReturnValue(null); // Simulate clearing by resetting getItem
          // Note: This doesn't perfectly replicate clearing the internal store
          // used by the global mock, but should satisfy the interface for this test file.
        }),
      },
      configurable: true // Ensure configurable for cleanup/restore
    });

    // Setup matchMedia mock for each test
    Object.defineProperty(window, 'matchMedia', {
      value: (query: string) => ({
        matches: mockMatchMedia(query),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  });

  it('uses system theme by default', () => {
    mockGetItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue(false);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('loads saved theme from localStorage', () => {
    mockGetItem.mockReturnValue('dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('allows changing theme', async () => {
    mockGetItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue(false);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Change to dark theme
    await userEvent.click(screen.getByText('Dark'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(mockSetItem).toHaveBeenCalledWith('theme', 'dark');

    // Change to light theme
    await userEvent.click(screen.getByText('Light'));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(mockSetItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('follows system theme when set to system', async () => {
    mockGetItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue(true); // System prefers dark

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Simulate system theme change
    mockMatchMedia.mockReturnValue(false); // System now prefers light
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryList.dispatchEvent(new Event('change'));

    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow(); // Check if *any* error is thrown when used outside provider

    consoleError.mockRestore();
  });
});
