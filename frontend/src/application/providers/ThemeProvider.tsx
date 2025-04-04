import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext, ThemeMode } from '../contexts/ThemeContext';

const STORAGE_KEY = 'novamind-theme-preference';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

/**
 * Provides theme context to the application
 * Implements dark mode with Tailwind CSS and system preference detection
 */
export const ThemeProvider = ({ 
  children, 
  defaultTheme = 'system' 
}: ThemeProviderProps): JSX.Element => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Try to get stored preference from localStorage
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    return (storedTheme as ThemeMode) || defaultTheme;
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent): void => {
      setSystemPrefersDark(e.matches);
    };
    
    // Add listener, using addEventListener or deprecated addListener for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Support for older browsers with legacy MediaQueryList interface
      (mediaQuery as MediaQueryList & {
        addListener: (listener: (e: MediaQueryListEvent) => void) => void
      }).addListener(handleChange);
    }
    
    return () => {
      // Cleanup listener
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Support for older browsers with legacy MediaQueryList interface
        (mediaQuery as MediaQueryList & {
          removeListener: (listener: (e: MediaQueryListEvent) => void) => void
        }).removeListener(handleChange);
      }
    };
  }, []);

  // Determine if dark mode is active based on mode and system preference
  const isDarkMode = useMemo((): boolean => {
    return mode === 'dark' || (mode === 'system' && systemPrefersDark);
  }, [mode, systemPrefersDark]);
  
  // Apply dark mode class to html element
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);
  
  // Set theme mode
  const setTheme = useCallback((newMode: ThemeMode): void => {
    setMode(newMode);
  }, []);
  
  // Toggle between light and dark modes
  const toggleTheme = useCallback((): void => {
    setMode(prevMode => {
      // If system, toggle to light/dark based on current appearance
      if (prevMode === 'system') {
        return systemPrefersDark ? 'light' : 'dark';
      }
      // If light, toggle to dark
      if (prevMode === 'light') {
        return 'dark';
      }
      // If dark, toggle to light
      return 'light';
    });
  }, [systemPrefersDark]);
  
  // Create memoized context value
  const contextValue = useMemo(() => ({
    mode,
    isDarkMode,
    setTheme,
    toggleTheme,
  }), [mode, isDarkMode, setTheme, toggleTheme]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
