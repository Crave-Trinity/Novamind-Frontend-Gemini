/* eslint-disable */
/**
 * ThemeProvider Component
 * 
 * A context provider for theme management, supporting light/dark mode
 * and custom theme configurations.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'dark' | 'light';
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  systemTheme: 'light',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Safely handle localStorage access in SSR/testing environments
    if (typeof window === 'undefined') return defaultTheme;
    
    try {
      const storedTheme = localStorage.getItem(storageKey);
      return (storedTheme as Theme) || defaultTheme;
    } catch (err) {
      console.error('Error accessing localStorage:', err);
      return defaultTheme;
    }
  });
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(() => {
    // Safely check for window and matchMedia availability (for SSR and testing)
    if (typeof window === 'undefined') return 'light';
    if (!window.matchMedia) return 'light';
    
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch (err) {
      console.error('Error detecting system theme:', err);
      return 'light';
    }
  });

  useEffect(() => {
    // Safely handle document manipulation in SSR/testing environments
    if (typeof window === 'undefined' || !window.document || !window.document.documentElement) return;
    
    try {
      const root = window.document.documentElement;
      
      // Remove all theme classes
      root.classList.remove('light', 'dark');
      
      // Apply appropriate theme class
      if (theme === 'system') {
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    } catch (err) {
      console.error('Error updating document theme classes:', err);
    }
  }, [theme, systemTheme]);

  useEffect(() => {
    // Save theme selection to localStorage, with error handling
    if (typeof window === 'undefined') return;
    
    try {
      // Always save theme selection to localStorage, regardless of whether it's 'system', 'light', or 'dark'
      localStorage.setItem(storageKey, theme);
    } catch (err) {
      console.error('Error saving theme to localStorage:', err);
    }
  }, [theme, storageKey]);

  useEffect(() => {
    // Safely handle cases where window or matchMedia might not be available (SSR/testing)
    if (typeof window === 'undefined' || !window.matchMedia) return;
    
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
      };
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => {
          mediaQuery.removeEventListener('change', handleChange);
        };
      }
      // Older browsers (legacy support)
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => {
          mediaQuery.removeListener(handleChange);
        };
      }
    } catch (err) {
      console.error('Error setting up media query listener:', err);
    }
  }, []);

  const value = {
    theme,
    setTheme,
    systemTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (!context || context === initialState) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
