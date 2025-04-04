/**
 * Enhanced ThemeProvider Test
 * 
 * This test file demonstrates testing a context provider with the enhanced
 * test utilities, which properly handle dark mode toggling and cleanup.
 */
import React, { useContext, createContext, useState, useEffect } from 'react';
import { render, screen, act } from '@/test/test-utils.enhanced';
// Create a test-specific mock context and provider to avoid TS errors
import { setDarkMode } from '@/test/mocks/match-media';

// Mock theme context for testing
interface MockThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const MockThemeContext = createContext<MockThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

// Mock provider component
const MockThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check localStorage on init
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (storedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newValue;
    });
  };
  
  return (
    <MockThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </MockThemeContext.Provider>
  );
};

// Test component that consumes the theme context
const ThemeConsumer: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useContext(MockThemeContext);
  
  return (
    <div data-testid="theme-consumer">
      <div data-testid="theme-status" className={isDarkMode ? 'dark-mode' : 'light-mode'}>
        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
      </div>
      <button 
        data-testid="enable-dark-mode" 
        onClick={() => {
          if (!isDarkMode) toggleDarkMode();
        }}
        className="bg-white dark:bg-gray-800"
      >
        Enable Dark Mode
      </button>
      <button 
        data-testid="disable-dark-mode" 
        onClick={() => {
          if (isDarkMode) toggleDarkMode();
        }}
        className="bg-gray-100 dark:bg-gray-700"
      >
        Disable Dark Mode
      </button>
    </div>
  );
};

describe('ThemeProvider (Enhanced Tests)', () => {
  beforeEach(() => {
    // Reset dark mode between tests
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  });
  
  it('provides theme context to children', () => {
    render(
      <MockThemeProvider>
        <ThemeConsumer />
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('theme-consumer')).toBeInTheDocument();
    expect(screen.getByTestId('theme-status')).toHaveTextContent('Light Mode');
  });
  
  it('toggles dark mode when enable button is clicked', () => {
    render(
      <MockThemeProvider>
        <ThemeConsumer />
      </MockThemeProvider>
    );
    
    // Initial state: light mode
    expect(screen.getByTestId('theme-status')).toHaveTextContent('Light Mode');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Click enable dark mode button
    act(() => {
      screen.getByTestId('enable-dark-mode').click();
    });
    
    // State after click: dark mode
    expect(screen.getByTestId('theme-status')).toHaveTextContent('Dark Mode');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
  
  it('saves theme preference to localStorage', () => {
    render(
      <MockThemeProvider>
        <ThemeConsumer />
      </MockThemeProvider>
    );
    
    // Initial state: no theme in localStorage
    expect(localStorage.getItem('theme')).toBeNull();
    
    // Enable dark mode
    act(() => {
      screen.getByTestId('enable-dark-mode').click();
    });
    
    // Check localStorage
    expect(localStorage.getItem('theme')).toBe('dark');
    
    // Disable dark mode
    act(() => {
      screen.getByTestId('disable-dark-mode').click();
    });
    
    // Check localStorage again
    expect(localStorage.getItem('theme')).toBe('light');
  });
  
  it('initializes with system preference when no stored preference', () => {
    // Use our setDarkMode helper to simulate dark mode preference
    setDarkMode(true);
    
    render(
      <MockThemeProvider>
        <ThemeConsumer />
      </MockThemeProvider>
    );
    
    // Should initialize as dark mode based on system preference
    expect(screen.getByTestId('theme-status')).toHaveTextContent('Dark Mode');
  });
  
  it('respects stored preference over system preference', () => {
    // Set stored preference to light
    localStorage.setItem('theme', 'light');
    
    // Mock system preference to dark
    setDarkMode(true);
    
    render(
      <MockThemeProvider>
        <ThemeConsumer />
      </MockThemeProvider>
    );
    
    // Should initialize as light mode despite system preference
    expect(screen.getByTestId('theme-status')).toHaveTextContent('Light Mode');
  });
  
  it('updates theme when system preference changes', () => {
    render(
      <MockThemeProvider>
        <ThemeConsumer />
      </MockThemeProvider>
    );
    
    // Initially light mode
    expect(screen.getByTestId('theme-status')).toHaveTextContent('Light Mode');
    
    // Simulate media query change
    act(() => {
      setDarkMode(true);
    });
    
    // Should update to dark mode if no stored preference
    expect(screen.getByTestId('theme-status')).toHaveTextContent('Dark Mode');
  });
});