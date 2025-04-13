/* eslint-disable */
import { render, screen, act, cleanup, waitFor } from '@testing-library/react'; // Import waitFor
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider';
import React from 'react'; // Import React for JSX

// Test component that uses the theme
function TestComponent() {
  const { mode, theme, isDarkMode: isDark, setTheme } = useTheme(); // Use the correct properties
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="theme">{theme}</span> {/* Display applied theme */}
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  let mockGetItem: ReturnType<typeof vi.fn>;
  let mockSetItem: ReturnType<typeof vi.fn>;
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  // Declare listener at describe scope
  let mediaQueryChangeListener: ((e: Partial<MediaQueryListEvent>) => void) | null = null;

  beforeEach(() => {
    // Reset mocks
    mockGetItem = vi.fn();
    mockSetItem = vi.fn();
    // Default mock for matchMedia (prefers light)
    mockMatchMedia = vi.fn().mockImplementation((query: string) => {
      if (query === '(prefers-color-scheme: dark)') {
        return false; // Default to prefers light
      }
      return false;
    });
    // Reset listener
    mediaQueryChangeListener = null;

    // Clear classes before each test
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.removeAttribute('class'); // Ensure clean slate

    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    // Setup matchMedia mock
    const mockMediaQueryListObject: {
      matches: boolean;
      media: string;
      onchange: null;
      addEventListener: ReturnType<typeof vi.fn>;
      removeEventListener: ReturnType<typeof vi.fn>;
      dispatchEvent: ReturnType<typeof vi.fn>;
      addListener: ReturnType<typeof vi.fn>;
      removeListener: ReturnType<typeof vi.fn>;
    } = {
      matches: mockMatchMedia('(prefers-color-scheme: dark)'),
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      // Capture the listener added by the component
      addEventListener: vi.fn((event, listener) => {
        if (event === 'change') {
          mediaQueryChangeListener = listener;
        }
      }),
      removeEventListener: vi.fn((event, listener) => {
        if (event === 'change' && mediaQueryChangeListener === listener) {
          mediaQueryChangeListener = null;
        }
      }),
      dispatchEvent: vi.fn(), // Not used in the refined test logic
      // Deprecated methods
      addListener: vi.fn((listener) => {
        mediaQueryChangeListener = listener;
      }),
      removeListener: vi.fn((listener) => {
        if (mediaQueryChangeListener === listener) {
          mediaQueryChangeListener = null;
        }
      }),
    };

    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation((query: string) => {
        if (query === '(prefers-color-scheme: dark)') {
          // Update the mock object's matches property based on the current mock function state
          mockMediaQueryListObject.matches = mockMatchMedia(query);
          // Return the mock MediaQueryList object
          return mockMediaQueryListObject;
        }
        // Return a default mock for other queries if necessary
        return {
          matches: false,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
        };
      }),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('uses system theme by default (prefers light)', async () => {
    mockGetItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue(false);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mode')).toHaveTextContent('system');
      expect(screen.getByTestId('theme')).toHaveTextContent('light'); // Context theme reflects applied
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  it('uses system theme by default (prefers dark)', async () => {
    mockGetItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue(true);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mode')).toHaveTextContent('system');
      expect(screen.getByTestId('theme')).toHaveTextContent('dark'); // Context theme reflects applied
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });
  });

  it('loads saved theme from localStorage', async () => {
    mockGetItem.mockReturnValue('dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('allows changing theme', async () => {
    mockGetItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue(false); // System prefers light

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initial state (system -> light)
    await waitFor(() => {
      expect(screen.getByTestId('mode')).toHaveTextContent('system');
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    // Change to dark theme
    await act(async () => {
      await userEvent.click(screen.getByText('Dark'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(mockSetItem).toHaveBeenCalledWith('theme', 'dark');
    });

    // Change to light theme
    await act(async () => {
      await userEvent.click(screen.getByText('Light'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('mode')).toHaveTextContent('light');
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(mockSetItem).toHaveBeenCalledWith('theme', 'light');
    });

    // Change back to system theme
    await act(async () => {
      await userEvent.click(screen.getByText('System'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('mode')).toHaveTextContent('system');
      // Should revert to system preference (light in this case)
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('theme');
    });
  });

  it('follows system theme when set to system', async () => {
    mockGetItem.mockReturnValue(null); // Start with system
    mockMatchMedia.mockReturnValue(true); // System prefers dark initially

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initial state (system -> dark)
    await waitFor(() => {
      expect(screen.getByTestId('mode')).toHaveTextContent('system');
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    // Simulate system theme change to light
    await act(async () => {
      mockMatchMedia.mockReturnValue(false); // Update mock return value
      // Manually call the captured listener with the new matches state
      if (mediaQueryChangeListener) {
        mediaQueryChangeListener({ matches: false } as Partial<MediaQueryListEvent>);
      }
    });

    // Use waitFor to ensure the effect listener has updated the DOM/context
    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
    expect(screen.getByTestId('mode')).toHaveTextContent('system'); // Mode state shouldn't change
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Simulate system theme change back to dark
    await act(async () => {
      mockMatchMedia.mockReturnValue(true); // Update mock return value
      // Manually call the captured listener with the new matches state
      if (mediaQueryChangeListener) {
        mediaQueryChangeListener({ matches: true } as Partial<MediaQueryListEvent>);
      }
    });

    // Use waitFor to ensure the effect listener has updated the DOM/context
    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this specific test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Expecting a specific error message is more robust
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleError.mockRestore();
  });
});
