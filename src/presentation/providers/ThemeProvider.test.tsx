/**
 * @vitest-environment jsdom
 */
/* eslint-disable */
// Import the test setup first to ensure JSDOM environment is properly configured
import '../../test/setup.ts';
import { render, screen, act, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider'; // Import from presentation layer
import React from 'react'; // Import React for JSX

// Test component that uses the theme
function TestComponent() {
  // This provider only exposes 'theme' and 'setTheme'
  const { theme, setTheme } = useTheme();
  return (
    <div>
      {/* Display applied theme */}
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  // No local beforeEach needed for mocks, as they are handled globally in setup.ts

  // We still need a standard afterEach for cleanup

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('uses system theme by default (prefers light)', async () => {
    // Use global mocks
    globalThis.mockLocalStorage.getItem.mockReturnValue(null);
    // Set initial state BEFORE rendering
    (globalThis as any).globalCurrentMatchesState = false; // Prefers light

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('uses system theme by default (prefers dark)', async () => {
    // Use global mocks
    globalThis.mockLocalStorage.getItem.mockReturnValue(null);
    // Set initial state BEFORE rendering
    (globalThis as any).globalCurrentMatchesState = true; // Prefers dark

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait specifically for the 'dark' class to be applied
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('loads saved theme from localStorage', async () => {
    // Use global mocks
    globalThis.mockLocalStorage.getItem.mockImplementation((key: string) => {
      // Use the correct storageKey from the component's default props
      if (key === 'ui-theme') return 'dark';
      return null;
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('allows changing theme', async () => {
    // Use global mocks
    globalThis.mockLocalStorage.getItem.mockReturnValue(null);
    // Set initial state BEFORE rendering
    (globalThis as any).globalCurrentMatchesState = false; // Prefers light

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initial state (system -> light)
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    // Change to dark theme
    await act(async () => {
      await userEvent.click(screen.getByText('Dark'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(globalThis.mockLocalStorage.setItem).toHaveBeenCalledWith('ui-theme', 'dark');

    // Change to light theme
    await act(async () => {
      await userEvent.click(screen.getByText('Light'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(globalThis.mockLocalStorage.setItem).toHaveBeenCalledWith('ui-theme', 'light');

    // Change back to system theme
    await act(async () => {
      await userEvent.click(screen.getByText('System'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
      // Class should revert to system preference (light)
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    // Assert setItem was called with 'system' (as per component logic)
    expect(globalThis.mockLocalStorage.setItem).toHaveBeenCalledWith('ui-theme', 'system');
    // The implementation doesn't call removeItem for system theme
    expect(globalThis.mockLocalStorage.removeItem).not.toHaveBeenCalled();
  });

  it('follows system theme when set to system', async () => {
    // Use global mocks
    globalThis.mockLocalStorage.getItem.mockReturnValue(null); // Start with system
    // Set initial state BEFORE rendering
    (globalThis as any).globalCurrentMatchesState = true; // Prefers dark

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initial state (system -> dark)
    // Wait specifically for the 'dark' class to be applied after the change
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });

    // Simulate system theme change to light
    await act(async () => {
      // Use the mock instance's helper to trigger the change correctly
      // Use the global mock instance's helper, ensuring it exists
      // Simulate system change using the global helper
      (globalThis as any).mockMediaQueryListInstance?._triggerChange?.(false); // Simulate change to light
      // Add a slightly longer delay to ensure effect runs
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Use waitFor to ensure the effect listener has updated the DOM
    // Wait specifically for the 'light' class after the change
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('light');
    });

    // After waiting, assert the absence of the 'dark' class
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Theme state remains 'system'
    expect(screen.getByTestId('theme').textContent).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Simulate system theme change back to dark
    await act(async () => {
      // Use the global mock instance's helper
      // Use the global mock instance's helper, ensuring it exists
      // Simulate system change using the global helper
      (globalThis as any).mockMediaQueryListInstance?._triggerChange?.(true); // Simulate change to dark
      // Add a slightly longer delay to ensure effect runs
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Use waitFor to ensure the effect listener has updated the DOM
    // Wait specifically for the 'dark' class after changing back
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });

    // Theme state remains 'system'
    expect(screen.getByTestId('theme').textContent).toBe('system');
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this specific test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Wrap in a function to capture the error
    const renderWithoutProvider = () => {
      render(<TestComponent />);
    };

    // Expecting a specific error message is more robust
    expect(renderWithoutProvider).toThrow('useTheme must be used within a ThemeProvider');

    consoleError.mockRestore();
  });
});
