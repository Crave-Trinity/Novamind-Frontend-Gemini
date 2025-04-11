import { render, screen, act, cleanup, waitFor } from '@testing-library/react'; // Import waitFor
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
  let mockGetItem: ReturnType<typeof vi.fn>;
  let mockSetItem: ReturnType<typeof vi.fn>;
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  // Declare listener at describe scope
  let mediaQueryChangeListener: ((e: Partial<MediaQueryListEvent>) => void) | null = null;
  // Store the mock media query list instance to access _triggerChange
  let mediaQueryListInstance: ReturnType<typeof window.matchMedia> | null = null;

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
    mediaQueryListInstance = null; // Reset instance

    // Clear classes before each test
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.removeAttribute('class'); // Ensure clean slate

    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
        removeItem: vi.fn(), // Keep removeItem mock for assertion
        clear: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    // Setup matchMedia mock - Capture listener
    const mockMediaQueryListObject: {
      matches: boolean;
      media: string;
      onchange: null;
      addEventListener: ReturnType<typeof vi.fn>;
      removeEventListener: ReturnType<typeof vi.fn>;
      dispatchEvent: ReturnType<typeof vi.fn>; // Keep dispatchEvent for potential fallback
      addListener: ReturnType<typeof vi.fn>; // Deprecated
      removeListener: ReturnType<typeof vi.fn>; // Deprecated
      _triggerChange?: (matches: boolean) => void; // Add helper signature
    } = {
      matches: mockMatchMedia('(prefers-color-scheme: dark)'),
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: vi.fn((event, listener) => {
        if (event === 'change' && listener) {
          mediaQueryChangeListener = listener; // Capture listener
        }
      }),
      removeEventListener: vi.fn((event, listener) => {
        if (event === 'change' && mediaQueryChangeListener === listener) {
          mediaQueryChangeListener = null;
        }
      }),
      dispatchEvent: vi.fn(), // Keep mock but don't rely on it
      addListener: vi.fn((listener) => {
        mediaQueryChangeListener = listener;
      }), // Deprecated fallback
      removeListener: vi.fn((listener) => {
        if (mediaQueryChangeListener === listener) {
          mediaQueryChangeListener = null;
        }
      }), // Deprecated fallback
      // Define _triggerChange here
      _triggerChange: function (matches: boolean) {
        this.matches = matches;
        if (mediaQueryChangeListener) {
          // Call listener directly within the mock's context
          mediaQueryChangeListener({ matches: this.matches } as Partial<MediaQueryListEvent>);
        } else {
          console.warn('Listener not captured when _triggerChange called');
        }
      },
    };
    // Store the instance for tests to call _triggerChange
    mediaQueryListInstance = mockMediaQueryListObject as unknown as MediaQueryList;

    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation((query: string) => {
        if (query === '(prefers-color-scheme: dark)') {
          mockMediaQueryListObject.matches = mockMatchMedia(query);
          return mockMediaQueryListObject; // Return the persistent object
        }
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
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
      expect(screen.getByTestId('theme')).toHaveTextContent('system');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
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
      expect(screen.getByTestId('theme')).toHaveTextContent('system');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('loads saved theme from localStorage', async () => {
    mockGetItem.mockReturnValue('dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
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
      expect(screen.getByTestId('theme')).toHaveTextContent('system');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    // Change to dark theme
    await act(async () => {
      await userEvent.click(screen.getByText('Dark'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(mockSetItem).toHaveBeenCalledWith('theme', 'dark');

    // Change to light theme
    await act(async () => {
      await userEvent.click(screen.getByText('Light'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(mockSetItem).toHaveBeenCalledWith('theme', 'light');

    // Change back to system theme
    await act(async () => {
      await userEvent.click(screen.getByText('System'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('system');
      // Class should revert to system preference (light)
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    // Assert setItem was called with 'system' (as per component logic)
    expect(mockSetItem).toHaveBeenCalledWith('theme', 'system');
    // Assert removeItem was NOT called (as per component logic)
    expect(window.localStorage.removeItem).not.toHaveBeenCalled();
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
      expect(screen.getByTestId('theme')).toHaveTextContent('system');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    // Simulate system theme change to light
    await act(async () => {
      // Use the mock instance's helper to trigger the change correctly
      if (mediaQueryListInstance?._triggerChange) {
        mediaQueryListInstance._triggerChange(false); // Simulate change to light
        // Add a microtask delay to allow state update to potentially settle
        await new Promise((resolve) => setTimeout(resolve, 0));
      } else {
        console.error('mediaQueryListInstance or _triggerChange not available in test');
      }
    });

    // Use waitFor to ensure the effect listener has updated the DOM
    await waitFor(
      () => {
        // Wait specifically for the 'light' class to appear
        expect(document.documentElement.classList.contains('light')).toBe(true);
      },
      { timeout: 1000 }
    ); // Increased timeout slightly more

    // After waiting, assert the absence of the 'dark' class
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Theme state remains 'system'
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Simulate system theme change back to dark
    await act(async () => {
      // Use the mock instance's helper to trigger the change correctly
      if (mediaQueryListInstance?._triggerChange) {
        mediaQueryListInstance._triggerChange(true); // Simulate change to dark
        // Add a microtask delay to allow state update to potentially settle
        await new Promise((resolve) => setTimeout(resolve, 0));
      } else {
        console.error('mediaQueryListInstance or _triggerChange not available in test');
      }
    });

    // Use waitFor to ensure the effect listener has updated the DOM
    await waitFor(
      () => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      },
      { timeout: 500 }
    ); // Increase timeout slightly

    // Theme state remains 'system'
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
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
